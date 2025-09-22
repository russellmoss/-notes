'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSupabase } from '@/hooks/useSupabase'

export default function Home() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const supabase = useSupabase()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session)
    })
  }, [supabase])

  return (
    <div className="center" style={{ minHeight: 'calc(100vh - 60px)', padding: 'var(--space-6)' }}>
      <div className="container">
        <div className="card stack">
          <div className="stack">
                <h1>Welcome to Russell&apos;s Notes</h1>
            <p className="text-muted">Choose where to go:</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href={authenticated ? '/review' : '/login'} className="card stack text-center hover:shadow-md transition-all">
              <div className="text-3xl">📝</div>
              <div className="font-semibold">Review</div>
              <div className="small">Review pending notes</div>
            </Link>
            <Link href={authenticated ? '/notes' : '/login'} className="card stack text-center hover:shadow-md transition-all">
              <div className="text-3xl">📚</div>
              <div className="font-semibold">Notes</div>
              <div className="small">Browse all notes</div>
            </Link>
            <Link href={authenticated ? '/chat' : '/login'} className="card stack text-center hover:shadow-md transition-all">
              <div className="text-3xl">💬</div>
              <div className="font-semibold">Chat</div>
              <div className="small">Ask across your notes</div>
            </Link>
            <Link href={authenticated ? '/upload' : '/login'} className="card stack text-center hover:shadow-md transition-all">
              <div className="text-3xl">⬆️</div>
              <div className="font-semibold">Upload</div>
              <div className="small">Import and merge notes</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
