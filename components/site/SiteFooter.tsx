import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="bg-black border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-white">
            Houston<span className="text-pink-500">Talent</span>Finder
          </p>
          <p className="text-sm text-gray-400 mt-2">
            We connect talent with producers and employers of SOB jobs in Houston and Texas. 18+ only.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold text-white mb-3">Talent</p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/register" className="hover:text-pink-400">Create a Free Profile</Link></li>
            <li><Link href="/login" className="hover:text-pink-400">Member Sign In</Link></li>
            <li><Link href="/dashboard" className="hover:text-pink-400">My Account</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-white mb-3">Producers &amp; Employers</p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/browse" className="hover:text-pink-400">Browse Talent</Link></li>
            <li><Link href="/messages" className="hover:text-pink-400">Messages</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-900 py-6 text-center text-xs text-gray-500 space-y-2 px-4">
        <p>© {new Date().getFullYear()} Houston Talent Finder. All rights reserved. You must be 18+ to use this site.</p>
        <p>Prostitution, escorting and any illegal services are strictly prohibited.</p>
        <div className="space-x-4">
          <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/2257" className="hover:text-white">2257 Compliance</Link>
        </div>
      </div>
    </footer>
  )
}
