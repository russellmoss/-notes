'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import { useSupabase } from '@/hooks/useSupabase'

export default function SiteNav() {
  const router = useRouter()
  const supabase = useSupabase()
  
  const handleLogout = async () => {
    try {
      // Sign out on client side first
      await supabase.auth.signOut()
      
      // Also call the server-side logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        // Force a page refresh to clear any cached state
        window.location.href = '/login'
      } else {
        console.error('Logout failed')
        // Even if server logout fails, redirect to login
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, try to redirect to login
      router.push('/login')
    }
  }
  
  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <div className="cluster">
          <Link href="/" className="font-semibold text-brand">Russell&apos;s Notes</Link>
        </div>
        <nav className="cluster">
          <Link href="/review" className="btn btn--ghost">Review</Link>
          <Link href="/notes" className="btn btn--ghost">Notes</Link>
          <Link href="/chat" className="btn btn--ghost">Chat</Link>
          <Link href="/upload" className="btn btn--ghost">Upload</Link>
          <ThemeToggle />
          <button onClick={handleLogout} className="btn btn--ghost">
            Logout
          </button>
        </nav>
      </div>
    </header>
  )
}
