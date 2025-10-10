// app/(dashboard)/dashboard/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Camera, User, Settings, LogOut, Upload, Eye, MessageSquare, Edit, AlertCircle } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const menuItems = [
    { icon: Edit, label: 'Edit Profile', href: '/profile/edit', description: 'Update your profile details', highlight: true },
    { icon: Camera, label: 'My Photos', href: '/media', description: 'Manage your photo gallery' },
    { icon: Upload, label: 'Upload Photos', href: '/media/upload', description: 'Add new photos to your portfolio' },
    { icon: Eye, label: 'View Profile', href: '/talent/' + session?.user?.username, description: 'See your public profile' },
    { icon: MessageSquare, label: 'Messages', href: '/messages', description: 'View and send messages' },
    { icon: Settings, label: 'Settings', href: '/settings', description: 'Account and privacy settings' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400 mt-1">Welcome back, {session?.user?.username || session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Profile Views</p>
                <p className="text-3xl font-bold text-white mt-1">0</p>
              </div>
              <Eye className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Photos</p>
                <p className="text-3xl font-bold text-white mt-1">0</p>
              </div>
              <Camera className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Profile Status</p>
                <p className="text-sm font-semibold text-yellow-500 mt-1">Pending Review</p>
              </div>
              <User className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Account Type</p>
                <p className="text-sm font-semibold text-white mt-1">Talent</p>
              </div>
              <Settings className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mb-8 bg-yellow-900/20 border border-yellow-600 rounded-lg p-6">
          <h3 className="text-yellow-500 font-semibold mb-2 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Complete Your Profile
          </h3>
          <p className="text-yellow-200 mb-4">
            Your profile is incomplete. Please update your profile with your information and photos to be discovered by producers.
          </p>
          <Link
            href="/profile/edit"
            className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            Complete Profile Now
          </Link>
        </div>

        {/* Action Cards */}
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition duration-200 border ${
                item.highlight ? 'border-yellow-600 ring-1 ring-yellow-600/50' : 'border-gray-700 hover:border-red-500'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`${item.highlight ? 'bg-yellow-600/20' : 'bg-red-600/20'} p-3 rounded-lg`}>
                  <item.icon className={`w-6 h-6 ${item.highlight ? 'text-yellow-500' : 'text-red-500'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {item.label}
                    {item.highlight && (
                      <span className="ml-2 text-xs bg-yellow-600 text-white px-2 py-0.5 rounded">Important</span>
                    )}
                  </h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Getting Started Guide */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Getting Started Checklist</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                ✓
              </div>
              <span className="text-gray-300">Create your account</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-white font-semibold">
                2
              </div>
              <span className="text-gray-300 font-semibold">Complete your profile (Edit Profile)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                3
              </div>
              <span className="text-gray-300">Upload photos to your portfolio</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                4
              </div>
              <span className="text-gray-300">Wait for profile approval (usually 24 hours)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                5
              </div>
              <span className="text-gray-300">Start connecting with producers!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
