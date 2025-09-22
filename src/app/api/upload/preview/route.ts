import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Removed unused function

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()

    // Build file list with content
    const files: { type: 'transcript' | 'written'; name: string; content: string }[] = []
    const entries = Array.from(form.entries()) as [string, any][]
    for (const [key, value] of entries) {
      if (key.startsWith('file_') && value && typeof value === 'object') {
        const idx = key.split('_')[1]
        const typeVal = (form.get(`type_${idx}`) as string) || 'written'
        const file = value as File
        const text = await (value as File).text()
        files.push({ type: (typeVal as any), name: file.name, content: text })
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    // Merge logic: keep full written content, plus transcript (full) as well
    const writtenParts = files.filter(f => f.type === 'written').map(f => `Written (${f.name})\n\n${f.content}`)
    const transcriptParts = files.filter(f => f.type === 'transcript').map(f => `Transcript (${f.name})\n\n${f.content}`)

    const mergedContext = [
      ...transcriptParts,
      ...writtenParts,
    ].join('\n\n---\n\n')

    const system = `You are a diligent executive assistant.
Create ONE cohesive summary and ONE cohesive action items section that integrates both transcripts and written notes.
Identify the people present in the meeting from names, speakers, or mentions. Use simple names (first + last when available).

For written notes, produce a beautifully formatted version while keeping meaning verbatim:
- Clean up spacing and line breaks; put distinct ideas on their own lines
- Normalize bullets/sub-bullets with clear hierarchy
- Lightly correct obvious spelling/grammar and fix clearly wrong words in context
- Add tasteful emojis for section headers and to break up dense text
- Add clear section headers where helpful (e.g., Overview, Decisions, Next Steps)
- Do not remove ideas or content; preserve meaning and details

Output JSON with fields:
- title (string)
- tldr (string)
- summary (string)
- action_items (array of {owner, task, due?})
- key_takeaways (array of strings)
- people (array of strings, unique)
- full_written (string; formatted, organized version of all written notes with emojis and structure)
Do not include any other fields.`

    const user = `Here are the materials for a single meeting or topic. Merge and summarize into one note.

${mergedContext}`

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.responses.create({
      model: 'gpt-5',
      input: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      text: { verbosity: 'medium' }
    })

    const content = completion.output_text || '{}'
    let parsed: any = {}
    try {
      parsed = JSON.parse(content)
    } catch {
      parsed = {}
    }

    const full_written = (parsed.full_written && typeof parsed.full_written === 'string')
      ? parsed.full_written
      : (writtenParts.join('\n\n---\n\n') || '')

    const preview = {
      title: parsed.title || files[0]?.name || 'Untitled Note',
      date_iso: new Date().toISOString().slice(0,10),
      type: 'Meeting',
      people: Array.isArray(parsed.people) ? parsed.people : [],
      source: 'Notes app',
      tldr: parsed.tldr || '',
      summary: parsed.summary || '',
      key_takeaways: parsed.key_takeaways || [],
      action_items: (parsed.action_items || []).map((ai: any) => ({ owner: ai.owner || '', task: ai.task || '', due: ai.due || null })),
      full_text: { body: full_written },
      content_hash: JSON.stringify({ files: files.map(f => f.name) }),
    }

    return NextResponse.json({ preview, files: files.map(f => ({ name: f.name, type: f.type })) })
  } catch (e: any) {
    console.error('Upload preview error', e)
    return NextResponse.json({ error: e?.message || 'Upload preview failed' }, { status: 500 })
  }
}
