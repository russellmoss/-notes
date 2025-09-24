import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import OpenAI from 'openai'
import {
  ChatRequest,
  ChatResponse,
  NotionContextNote,
  OpenAIResponse
} from '../../../types/chat.types'
import { NotionDatabase, NotionDataSourceQueryResult, NotionPage } from '../../../types/notion.types'

function parseDateRange(params: URLSearchParams) {
  const preset = params.get('preset') // '30','60','90','custom'
  const start = params.get('start')
  const end = params.get('end')
  const now = new Date()
  const endDate = end ? new Date(end) : now
  let startDate = start ? new Date(start) : new Date(now)

  if (preset && preset !== 'custom') {
    const days = parseInt(preset, 10)
    startDate = new Date(now)
    startDate.setDate(now.getDate() - days)
  }

  // normalize
  startDate.setHours(0,0,0,0)
  endDate.setHours(23,59,59,999)
  return { startDate, endDate }
}

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json() as ChatRequest
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Missing question' }, { status: 400 })
    }

    const params = new URL(req.url).searchParams
    const { startDate, endDate } = parseDateRange(params)

    const notion = new Client({ auth: process.env.NOTION_TOKEN! })
    const database = await notion.databases.retrieve({ database_id: process.env.NOTION_DB_ID! }) as NotionDatabase
    const dataSourceId = database.data_sources?.[0]?.id
    if (!dataSourceId) return NextResponse.json({ error: 'No Notion data source' }, { status: 500 })

    // Pull pages in window by Submission Date and include key fields for context
    const result = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        and: [
          {
            property: 'Submission Date',
            date: {
              after: startDate.toISOString(),
              before: endDate.toISOString(),
            },
          },
          { property: 'Title', title: { is_not_empty: true } },
        ],
      },
      page_size: 100,
    }) as NotionDataSourceQueryResult

    const notes: NotionContextNote[] = (result.results || []).map((page: NotionPage) => {
      const p = page.properties
      return {
        id: page.id,
        url: page.url || '',
        title: p.Title?.title?.[0]?.text?.content || 'Untitled',
        date: p.Date?.date?.start || '',
        submissionDate: p['Submission Date']?.date?.start || '',
        tldr: p.TLDR?.rich_text?.[0]?.text?.content || '',
        summary: p.Summary?.rich_text?.[0]?.text?.content || '',
      }
    })

    const contextBlocks = notes.map((n: NotionContextNote) => (
      `Title: ${n.title}\nDate: ${n.date}\nSubmitted: ${n.submissionDate}\nTLDR: ${n.tldr}\nSummary: ${n.summary}\nLink: ${n.url}`
    ))

    const system = `You are an expert executive assistant for a Revenue Operations manager.
Use the provided notes as primary context. When helpful, you may use up-to-date web knowledge, but prioritize the notes.
Synthesize thorough, actionable answers. Format your response as clean HTML with proper styling:
- Use <h2> for main headings, <h3> for subheadings
- Use <strong> for bold text, <em> for emphasis
- Use <ul> and <li> for bullet points
- Use <p> for paragraphs with proper spacing
- Use <a href="url">title</a> for links
- Use <div class="mt-4"> for spacing between sections
- Keep the HTML clean and semantic, no raw markdown
- Do NOT wrap your response in code blocks or markdown formatting
- Cite relevant notes by title with links at the end under a heading "Sources".
If a note is referenced, include its link in the sources.`

    const prompt = `User question: ${question}\n\nNotes context (${notes.length} documents, ${startDate.toDateString()} to ${endDate.toDateString()}):\n\n${contextBlocks.join('\n\n---\n\n')}`

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.responses.create({
      model: 'gpt-5-chat-latest',
      input: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      text: { verbosity: 'medium' }
    }) as OpenAIResponse

    const answer = completion.output_text || ''

    // crude heuristic: collect cited titles if the model used them
    const citations = notes.slice(0, 10).map((n: NotionContextNote) => ({ title: n.title, url: n.url }))

    const response: ChatResponse = { answer, citations, count: notes.length, window: { start: startDate, end: endDate } }
    return NextResponse.json(response)
  } catch (e: unknown) {
    console.error('Chat error', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Chat failed' }, { status: 500 })
  }
}
