import { NextRequest, NextResponse } from 'next/server'
import { createNotePage } from '@/lib/notion'

export async function POST(req: NextRequest) {
  try {
    const { preview } = await req.json()
    if (!preview) return NextResponse.json({ error: 'Missing preview' }, { status: 400 })

    const result = await createNotePage(preview, undefined)
    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    console.error('Upload submit error', e)
    return NextResponse.json({ error: e?.message || 'Upload submit failed' }, { status: 500 })
  }
}
