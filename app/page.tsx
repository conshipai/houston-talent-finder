// app/page.tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Houston Talent Finder
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Exclusive Members-Only Platform for Adult Entertainment Professionals
            </p>
            
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <p className="text-red-200 font-semibold">
                🔒 All Content Requires Verified Membership
              </p>
              <p className="text-gray-300 text-sm mt-2">
                Talent profiles and content are only accessible to registered, verified members
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
              >
                Join as Talent
              </Link>
              <Link
                href="/login"
                className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
              >
                Member Sign In
              </Link>
            </div>
            
            <p className="mt-6 text-sm text-gray-400">
              18+ Only • Verified Members Only • ID Required
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Private Professional Network
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              100% Private
            </h3>
            <p className="text-gray-400">
              All talent profiles and content are behind secure login. No public access.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Verified Members
            </h3>
            <p className="text-gray-400">
              All members are verified. Both talent and clients must pass verification.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Professional Network
            </h3>
            <p className="text-gray-400">
              Connect with verified producers and industry professionals. Paid opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join Our Exclusive Network?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Talent keeps full control of their content and pricing
          </p>
          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">For Talent</h3>
            <ul className="text-gray-300 text-left max-w-2xl mx-auto space-y-2">
              <li>✓ Your content stays behind paywall - members only access</li>
              <li>✓ Set your own rates and boundaries</li>
              <li>✓ Connect with verified, paying clients</li>
              <li>✓ All photos require admin approval for safety</li>
              <li>✓ Direct messaging with interested producers</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-10 rounded-lg text-lg transition duration-200"
            >
              Register as Talent
            </Link>
            <Link
              href="/login"
              className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-10 rounded-lg text-lg transition duration-200"
            >
              Member Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p className="mb-2">© 2024 Houston Talent Finder. All rights reserved.</p>
          <p className="text-xs mb-4">
            Private members-only platform. Must be 18+ to register. All content is protected.
          </p>
          <div className="space-x-4">
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/2257" className="hover:text-white">2257 Compliance</Link>
            <Link href="/login" className="hover:text-white">Member Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
