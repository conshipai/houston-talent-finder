'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, Sparkles } from 'lucide-react'

export default function SiteHeader() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/register', label: 'For Talent' },
    { href: '/browse', label: 'Browse Talent' },
    { href: '/messages', label: 'Messages' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur border-b border-pink-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Houston<span className="text-pink-500">Talent</span>Finder
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-sm font-semibold text-gray-300 hover:text-pink-400 transition">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm font-semibold text-gray-300 hover:text-white">
                My Account
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm font-semibold text-gray-400 hover:text-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-gray-300 hover:text-white">
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-bold bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-full transition"
              >
                Join Free
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-800 bg-black px-4 py-4 space-y-3">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block font-semibold text-gray-200">
              {l.label}
            </Link>
          ))}
          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="block font-semibold text-gray-200">
                My Account
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="block font-semibold text-gray-400">
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1 text-center border border-gray-600 text-white py-2 rounded-full">
                Sign In
              </Link>
              <Link href="/register" className="flex-1 text-center bg-pink-600 text-white font-bold py-2 rounded-full">
                Join Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
