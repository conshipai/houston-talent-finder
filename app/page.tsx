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
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Exclusive Platform for Adult Entertainment Professionals
            </p>
            
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
                Sign In
              </Link>
            </div>
            
            <p className="mt-6 text-sm text-gray-400">
              18+ Only • Members Only Platform • Verification Required
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
              Members Only
            </h3>
            <p className="text-gray-400">
              Registration and verification required to access talent profiles and content.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Verified Profiles
            </h3>
            <p className="text-gray-400">
              All talent profiles are reviewed and verified before activation.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Professional Network
            </h3>
            <p className="text-gray-400">
              Connect directly with verified producers and industry professionals.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Exclusive Network
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Create your profile and connect with Houston's adult entertainment industry
          </p>
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
              Sign In to Browse
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p className="mb-2">© 2024 Houston Talent Finder. All rights reserved.</p>
          <p className="text-xs mb-4">
            This is a private, members-only platform. Must be 18+ to register.
          </p>
          <div className="space-x-4">
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/login" className="hover:text-white">Member Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
