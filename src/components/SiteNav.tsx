'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'
import { useSupabase } from '@/hooks/useSupabase'

export default function SiteNav() {
  const router = useRouter()
  const supabase = useSupabase()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }
  
  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <div className="cluster">
          <Link href="/" className="font-semibold text-brand">Russell&apos;s Notes</Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex cluster">
          <Link href="/review" className="btn btn--ghost">Review</Link>
          <Link href="/notes" className="btn btn--ghost">Notes</Link>
          <Link href="/chat" className="btn btn--ghost">Chat</Link>
          <Link href="/upload" className="btn btn--ghost">Upload</Link>
          <ThemeToggle />
          <button onClick={handleLogout} className="btn btn--ghost">
            Logout
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle mobile menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <nav className="container py-4 space-y-2">
            <Link
              href="/review"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              Review
            </Link>
            <Link
              href="/notes"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              Notes
            </Link>
            <Link
              href="/chat"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              Chat
            </Link>
            <Link
              href="/upload"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              Upload
            </Link>
            <div className="px-4 py-2">
              <ThemeToggle />
            </div>
            <button
              onClick={() => {
                closeMobileMenu()
                handleLogout()
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
