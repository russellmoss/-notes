import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { Client } from '@notionhq/client'
import {
  MessageRequest,
  MessageResponse,
  ConversationResponse,
  NotionContextNote,
  OpenAIMessage,
  OpenAIResponse
} from '@/types/chat.types'
import { NotionDatabase, NotionDataSourceQueryResult, NotionPage } from '@/types/notion.types'

function getSupabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServer()
  const { searchParams } = new URL(req.url)
  const conversation_id = searchParams.get('conversation_id')
  if (!conversation_id) return NextResponse.json({ error: 'conversation_id required' }, { status: 400 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  const response: ConversationResponse = { messages: data || [] }
  return NextResponse.json(response)
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer()
  const { conversation_id, content } = await req.json() as MessageRequest
  if (!conversation_id || !content) return NextResponse.json({ error: 'conversation_id and content required' }, { status: 400 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Insert user message
  const { error: insErr } = await supabase.from('messages').insert({ conversation_id, role: 'user', content })
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

  // Fetch conversation history
  const { data: hist } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: true })

  const messages: OpenAIMessage[] = (hist || []).map(m => ({ role: m.role as 'system'|'user'|'assistant', content: m.content }))

  // Get Notion context for the latest user message
  const latestUserMessage = messages.filter(m => m.role === 'user').pop()
  let notionContext = ''
  
  if (latestUserMessage) {
    try {
      const notion = new Client({ auth: process.env.NOTION_TOKEN! })
      const database = await notion.databases.retrieve({ database_id: process.env.NOTION_DB_ID! }) as NotionDatabase
      const dataSourceId = database.data_sources?.[0]?.id
      
      if (dataSourceId) {
        const now = new Date()
        const startDate = new Date(now)
        startDate.setDate(now.getDate() - 30) // Last 30 days
        startDate.setHours(0,0,0,0)
        now.setHours(23,59,59,999)
        
        const result = await (notion as any).dataSources.query({
          data_source_id: dataSourceId,
          filter: {
            and: [
              {
                property: 'Submission Date',
                date: {
                  after: startDate.toISOString(),
                  before: now.toISOString(),
                },
              },
              { property: 'Title', title: { is_not_empty: true } },
            ],
          },
          page_size: 50,
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

        notionContext = `\n\nRelevant notes context (${notes.length} documents, last 30 days):\n\n${contextBlocks.join('\n\n---\n\n')}`
      }
    } catch (e) {
      console.error('Failed to fetch Notion context:', e)
    }
  }

  // Add system message with Notion context
  const systemMessage: OpenAIMessage = {
    role: 'system',
    content: `You are an expert executive assistant for a Revenue Operations manager.
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
If a note is referenced, include its link in the sources.${notionContext}`
  }

  // Generate assistant reply
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const completion = await openai.responses.create({
    model: 'gpt-5-chat-latest',
    input: [systemMessage, ...messages],
    text: { verbosity: 'medium' }
  }) as OpenAIResponse
  const reply = completion.output_text || ''

  // Save assistant message
  const { error: insAsstErr } = await supabase.from('messages').insert({ conversation_id, role: 'assistant', content: reply })
  if (insAsstErr) return NextResponse.json({ error: insAsstErr.message }, { status: 500 })

  // Touch conversation updated_at
  await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversation_id)

  const response: MessageResponse = { reply }
  return NextResponse.json(response)
}
