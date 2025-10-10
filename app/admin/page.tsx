'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, Image, Shield, MessageSquare, 
  AlertCircle, CheckCircle, XCircle, Eye,
  BarChart, Clock, Mail
} from 'lucide-react'

interface Stats {
  totalUsers: number
  pendingProfiles: number
  pendingPhotos: number
  activeProducers: number
}

interface PendingProfile {
  id: string
  username: string
  email: string
  createdAt: string
  mediaCount: number
}

interface PendingMedia {
  id: string
  url: string
  thumbnailUrl: string
  username: string
  userId: string
  uploadedAt: string
  type: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [pendingProfiles, setPendingProfiles] = useState<PendingProfile[]>([])
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    checkAdminAndLoadData()
  }, [])

  const checkAdminAndLoadData = async () => {
    try {
      // Check if user is admin
      const res = await fetch('/api/admin/verify')
      if (!res.ok) {
        router.push('/dashboard')
        return
      }

      // Load dashboard data
      await Promise.all([
        loadStats(),
        loadPendingProfiles(),
        loadPendingMedia()
      ])
    } catch (error) {
      console.error('Error loading admin dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    const res = await fetch('/api/admin/stats')
    if (res.ok) {
      const data = await res.json()
      setStats(data)
    }
  }

  const loadPendingProfiles = async () => {
    const res = await fetch('/api/admin/pending-profiles')
    if (res.ok) {
      const data = await res.json()
      setPendingProfiles(data.profiles || [])
    }
  }

  const loadPendingMedia = async () => {
    const res = await fetch('/api/admin/pending-media')
    if (res.ok) {
      const data = await res.json()
      setPendingMedia(data.media || [])
    }
  }

  const approveProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/approve-profile/${userId}`, {
        method: 'POST'
      })
      if (res.ok) {
        setPendingProfiles(prev => prev.filter(p => p.id !== userId))
        loadStats()
      }
    } catch (error) {
      console.error('Error approving profile:', error)
    }
  }

  const rejectProfile = async (userId: string) => {
    if (!confirm('Are you sure you want to reject this profile?')) return
    
    try {
      const res = await fetch(`/api/admin/reject-profile/${userId}`, {
        method: 'POST'
      })
      if (res.ok) {
        setPendingProfiles(prev => prev.filter(p => p.id !== userId))
        loadStats()
      }
    } catch (error) {
      console.error('Error rejecting profile:', error)
    }
  }

  const approveMedia = async (mediaId: string) => {
    try {
      const res = await fetch(`/api/admin/approve-media/${mediaId}`, {
        method: 'POST'
      })
      if (res.ok) {
        setPendingMedia(prev => prev.filter(m => m.id !== mediaId))
        loadStats()
      }
    } catch (error) {
      console.error('Error approving media:', error)
    }
  }

  const rejectMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to reject this photo?')) return
    
    try {
      const res = await fetch(`/api/admin/reject-media/${mediaId}`, {
        method: 'POST'
      })
      if (res.ok) {
        setPendingMedia(prev => prev.filter(m => m.id !== mediaId))
        loadStats()
      }
    } catch (error) {
      console.error('Error rejecting media:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg border-b border-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm">Manage platform content and users</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-yellow-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Profiles</p>
                <p className="text-3xl font-bold text-yellow-500 mt-1">{stats?.pendingProfiles || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Photos</p>
                <p className="text-3xl font-bold text-orange-500 mt-1">{stats?.pendingPhotos || 0}</p>
              </div>
              <Image className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Producers</p>
                <p className="text-3xl font-bold text-green-500 mt-1">{stats?.activeProducers || 0}</p>
              </div>
              <BarChart className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`pb-3 px-1 ${activeTab === 'profiles' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
          >
            Pending Profiles ({pendingProfiles.length})
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`pb-3 px-1 ${activeTab === 'media' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
          >
            Pending Media ({pendingMedia.length})
          </button>
          <button
            onClick={() => router.push('/admin/users')}
            className="pb-3 px-1 text-gray-400 hover:text-white"
          >
            All Users
          </button>
          <button
            onClick={() => router.push('/admin/messages')}
            className="pb-3 px-1 text-gray-400 hover:text-white"
          >
            Send Messages
          </button>
        </div>

        {/* Content */}
        {activeTab === 'profiles' && (
          <div className="space-y-4">
            {pendingProfiles.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-400">No pending profiles to review</p>
              </div>
            ) : (
              pendingProfiles.map(profile => (
                <div key={profile.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{profile.username}</h3>
                      <p className="text-gray-400 text-sm">{profile.email}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Joined {new Date(profile.createdAt).toLocaleDateString()} • {profile.mediaCount} photos
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/talent/${profile.username}`)}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                        title="View Profile"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => approveProfile(profile.id)}
                        className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
                        title="Approve"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => rejectProfile(profile.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                        title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pendingMedia.length === 0 ? (
              <div className="col-span-full bg-gray-800 rounded-lg p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-400">No pending media to review</p>
              </div>
            ) : (
              pendingMedia.map(media => (
                <div key={media.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                  <div className="aspect-square relative">
                    <img
                      src={media.thumbnailUrl || media.url}
                      alt="Pending media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-400 truncate">{media.username}</p>
                    <p className="text-xs text-gray-500">{new Date(media.uploadedAt).toLocaleDateString()}</p>
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => approveMedia(media.id)}
                        className="flex-1 p-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectMedia(media.id)}
                        className="flex-1 p-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
