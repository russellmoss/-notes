import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = getSupabaseClient()
    
    // Sign out the user
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
