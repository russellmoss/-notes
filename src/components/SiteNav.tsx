'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

export default function SiteNav() {
  const router = useRouter()
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        router.push('/login')
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
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
