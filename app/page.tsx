// app/page.tsx
import Link from 'next/link'
import { Users, Search, Shield, Star, Camera, Heart } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Houston Talent Finder
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Connect with Houston's premier adult entertainment talent and producers
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/browse"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition duration-200"
              >
                Browse Talent
              </Link>
              <Link
                href="/register"
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition duration-200"
              >
                Join as Talent
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-red-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Local Talent</h3>
            <p className="text-gray-400">Connect with verified Houston-area performers and models</p>
          </div>
          
          <div className="text-center">
            <div className="bg-red-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Safe & Secure</h3>
            <p className="text-gray-400">Age-verified profiles with admin moderation</p>
          </div>
          
          <div className="text-center">
            <div className="bg-red-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Professional Portfolios</h3>
            <p className="text-gray-400">High-quality galleries and detailed profiles</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-800 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8">Join Houston's premier adult talent platform today</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition duration-200"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2024 Houston Talent Finder. All rights reserved.</p>
            <p className="mt-2">You must be 18+ to use this platform</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
