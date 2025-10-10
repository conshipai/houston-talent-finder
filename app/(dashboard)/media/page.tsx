// app/(dashboard)/media/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Camera, Upload, Trash2, Star, Eye, EyeOff, 
  CheckCircle, XCircle, Clock, AlertCircle, Grid,
  Image as ImageIcon, Settings, Info, Download
} from 'lucide-react'

interface MediaItem {
  id: string
  url: string
  thumbnailUrl: string | null
  title: string | null
  description: string | null
  isProfilePhoto: boolean
  isPublic: boolean
  isApproved: boolean
  isExplicit: boolean
  views: number
  size: number
  mimeType: string
  createdAt: string
  updatedAt: string
}

export default function MediaGalleryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all')
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    profilePhoto: false
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      loadMedia()
    }
  }, [status, router])

  const loadMedia = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/upload')
      if (response.ok) {
        const data = await response.json()
        setMedia(data.media || [])
        calculateStats(data.media || [])
      }
    } catch (error) {
      console.error('Error loading media:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (mediaItems: MediaItem[]) => {
    const approved = mediaItems.filter(m => m.isApproved).length
    const pending = mediaItems.filter(m => !m.isApproved).length
    const hasProfilePhoto = mediaItems.some(m => m.isProfilePhoto)
    
    setStats({
      total: mediaItems.length,
      approved,
      pending,
      profilePhoto: hasProfilePhoto
    })
  }

  const deleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/upload/${mediaId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMedia(prev => prev.filter(m => m.id !== mediaId))
        setSelectedMedia(null)
        calculateStats(media.filter(m => m.id !== mediaId))
      }
    } catch (error) {
      console.error('Error deleting media:', error)
    }
  }

  const setAsProfilePhoto = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/upload/${mediaId}/profile-photo`, {
        method: 'POST'
      })

      if (response.ok) {
        setMedia(prev => prev.map(m => ({
          ...m,
          isProfilePhoto: m.id === mediaId
        })))
        setStats(prev => ({ ...prev, profilePhoto: true }))
      }
    } catch (error) {
      console.error('Error setting profile photo:', error)
    }
  }

  const toggleVisibility = async (mediaId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/upload/${mediaId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublic: !isPublic })
      })

      if (response.ok) {
        setMedia(prev => prev.map(m => 
          m.id === mediaId ? { ...m, isPublic: !isPublic } : m
        ))
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
    }
  }

  const toggleExplicit = async (mediaId: string, isExplicit: boolean) => {
    try {
      const response = await fetch(`/api/upload/${mediaId}/explicit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isExplicit: !isExplicit })
      })

      if (response.ok) {
        setMedia(prev => prev.map(m => 
          m.id === mediaId ? { ...m, isExplicit: !isExplicit } : m
        ))
      }
    } catch (error) {
      console.error('Error toggling explicit flag:', error)
    }
  }

  const filteredMedia = media.filter(m => {
    if (filter === 'all') return true
    if (filter === 'approved') return m.isApproved
    if (filter === 'pending') return !m.isApproved
    return false
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB'
    else return Math.round(bytes / 1048576) + ' MB'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading your media...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">My Photo Gallery</h1>
              <p className="text-gray-400 mt-1">Manage your portfolio photos</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/media/upload"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photos</span>
              </Link>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-400 hover:text-white"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Photos</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Camera className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-yellow-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Profile Photo</p>
                <p className="text-sm font-semibold text-white">
                  {stats.profilePhoto ? 'Set' : 'Not Set'}
                </p>
              </div>
              <Star className={`w-8 h-8 ${stats.profilePhoto ? 'text-yellow-500' : 'text-gray-600'}`} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Photos ({media.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'approved' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Pending ({stats.pending})
          </button>
        </div>

        {/* Notice */}
        {!stats.profilePhoto && (
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <p className="text-yellow-200 font-medium">No Profile Photo Set</p>
                <p className="text-yellow-200/80 text-sm mt-1">
                  Select one of your photos and set it as your profile photo to appear in search results.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {filteredMedia.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl mb-2">
              {filter === 'all' 
                ? 'No photos uploaded yet' 
                : `No ${filter} photos`}
            </p>
            <p className="text-gray-500 mb-6">
              Upload photos to build your portfolio
            </p>
            <Link
              href="/media/upload"
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
            >
              Upload Your First Photo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedia.map(item => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg overflow-hidden group relative cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                {/* Status Badge */}
                <div className="absolute top-2 left-2 z-10 flex space-x-2">
                  {item.isProfilePhoto && (
                    <div className="bg-yellow-600 text-white px-2 py-1 rounded text-xs flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Profile
                    </div>
                  )}
                  {item.isExplicit && (
                    <div className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                      18+
                    </div>
                  )}
                </div>

                {/* Approval Status */}
                <div className="absolute top-2 right-2 z-10">
                  {item.isApproved ? (
                    <CheckCircle className="w-5 h-5 text-green-500 bg-gray-800 rounded-full" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500 bg-gray-800 rounded-full" />
                  )}
                </div>

                {/* Image */}
                <div className="aspect-square bg-gray-700">
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.title || 'Gallery photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-white font-medium">
                      {item.isPublic ? 'Public' : 'Private'}
                    </p>
                    <p className="text-gray-300 text-sm mt-1">
                      {formatFileSize(item.size)}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {item.views} views
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">Photo Details</h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image */}
                <div>
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.title || 'Photo'}
                    className="w-full rounded-lg"
                  />
                </div>
                
                {/* Details & Actions */}
                <div className="space-y-4">
                  {/* Status */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Approval:</span>
                        <span className={`font-medium ${
                          selectedMedia.isApproved ? 'text-green-500' : 'text-yellow-500'
                        }`}>
                          {selectedMedia.isApproved ? 'Approved' : 'Pending Review'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Visibility:</span>
                        <span className="text-gray-300">
                          {selectedMedia.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">18+ Content:</span>
                        <span className="text-gray-300">
                          {selectedMedia.isExplicit ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Views:</span>
                        <span className="text-gray-300">{selectedMedia.views}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Size:</span>
                        <span className="text-gray-300">{formatFileSize(selectedMedia.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Uploaded:</span>
                        <span className="text-gray-300">
                          {new Date(selectedMedia.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {!selectedMedia.isProfilePhoto && (
                      <button
                        onClick={() => setAsProfilePhoto(selectedMedia.id)}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2"
                      >
                        <Star className="w-4 h-4" />
                        <span>Set as Profile Photo</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => toggleVisibility(selectedMedia.id, selectedMedia.isPublic)}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2"
                    >
                      {selectedMedia.isPublic ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>Make Private</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Make Public</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => toggleExplicit(selectedMedia.id, selectedMedia.isExplicit)}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <Info className="w-4 h-4" />
                      <span>{selectedMedia.isExplicit ? 'Remove' : 'Mark as'} 18+ Content</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        deleteMedia(selectedMedia.id)
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Photo</span>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-3">
                    <p className="text-blue-200 text-sm">
                      <Info className="w-4 h-4 inline mr-1" />
                      Photos must be approved by admin before they appear publicly. This usually takes 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
