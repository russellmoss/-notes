import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

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

export async function GET() {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conversations: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title } = await req.json()
  
  // Generate a better title using AI if the title is just the raw message
  let finalTitle = title
  if (title && title.length > 20) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const completion = await openai.responses.create({
        model: 'gpt-5',
        input: [
          { 
            role: 'user', 
            content: `Create a concise, descriptive title (3-6 words) for a chat conversation that started with this message: "${title}"` 
          }
        ],
        text: { verbosity: 'low' }
      })
      const aiTitle = completion.output_text?.trim()
      if (aiTitle && aiTitle.length > 0 && aiTitle.length < 50) {
        finalTitle = aiTitle
      }
    } catch (e) {
      console.error('Failed to generate AI title:', e)
      // Fall back to truncated original title
      finalTitle = title.slice(0, 50)
    }
  }
  
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: user.id, title: finalTitle })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conversation: data })
}
