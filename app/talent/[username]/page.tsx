// app/talent/[username]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { 
  MapPin, Calendar, Ruler, Eye, Palette, 
  Instagram, Globe, ArrowLeft, MessageSquare,
  CheckCircle, AlertCircle, Clock, Lock
} from 'lucide-react'

interface PageProps {
  params: { username: string }
}

export default async function TalentProfilePage({ params }: PageProps) {
  // Get current session to check if user is viewing their own profile
  const session = await getServerSession(authOptions)

  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: params.username,
        mode: 'insensitive'
      }
    },
    include: {
      profile: true,
      media: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!user || user.role !== 'TALENT') {
    notFound()
  }

  // Check if this is the user's own profile
  const sessionUsername = session?.user?.username?.toLowerCase()
  const isOwnProfile = session?.user?.id === user.id || sessionUsername === user.username.toLowerCase()
  const isAdmin = session?.user?.role === 'ADMIN'
  const canSeeAllMedia = isOwnProfile || isAdmin

  const visibleMedia = canSeeAllMedia
    ? user.media
    : user.media.filter((m: any) => m.isApproved && m.isPublic)

  const profilePhoto = visibleMedia.find((m: any) => m.isProfilePhoto)
  const galleryPhotos = visibleMedia.filter((m: any) => !m.isProfilePhoto)
  const isVerified = user.profile?.verified

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/browse"
              className="flex items-center space-x-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Browse</span>
            </Link>
            <div className="flex items-center space-x-3">
              {isOwnProfile && (
                <Link
                  href="/profile/edit"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Edit Profile
                </Link>
              )}
              {!isOwnProfile && (
                <Link
                  href="/login"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contact</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show notice if viewing own profile with pending content */}
        {canSeeAllMedia && visibleMedia.some((m: any) => !m.isApproved) && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <p className="text-yellow-200 font-medium">Some photos are pending approval</p>
                <p className="text-yellow-200/80 text-sm mt-1">
                  Photos marked with a clock icon are waiting for admin approval and are only visible to you and site administrators.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              {/* Profile Photo */}
              <div className="aspect-square bg-gray-700 relative">
                {profilePhoto ? (
                  <>
                    <img
                      src={profilePhoto.url}
                      alt={user.profile?.stageName || user.username}
                      className="w-full h-full object-cover"
                    />
                    {/* Show approval status if own profile */}
                    {isOwnProfile && !profilePhoto.isApproved && (
                      <div className="absolute top-2 right-2 bg-yellow-600 text-white px-2 py-1 rounded flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span className="text-xs">Pending</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No profile photo</div>
                )}
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              {galleryPhotos.length === 0 ? (
                <div className="text-center text-gray-400">
                  <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No portfolio photos yet</p>
                  {isOwnProfile && (
                    <Link
                      href="/media/upload"
                      className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      Upload Photos
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryPhotos.map((photo: any) => (
                    <div
                      key={photo.id}
                      className="aspect-square bg-gray-700 rounded-lg overflow-hidden relative group"
                    >
                      <img
                        src={photo.thumbnailUrl || photo.url}
                        alt={photo.title || 'Portfolio photo'}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />

                      {/* Show status badges for own profile */}
                      {canSeeAllMedia && (
                        <div className="absolute top-2 left-2 flex flex-col gap-2">
                          {!photo.isApproved && (
                            <div className="bg-yellow-600 text-white px-2 py-1 rounded text-xs flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </div>
                          )}
                          {!photo.isPublic && (
                            <div className="bg-gray-600 text-white px-2 py-1 rounded text-xs flex items-center">
                              <Lock className="w-3 h-3 mr-1" />
                              Private
                            </div>
                          )}
                          {photo.isExplicit && (
                            <div className="bg-red-600 text-white px-2 py-1 rounded text-xs">18+</div>
                          )}
                        </div>
                      )}

                      {/* Show approved badge for others */}
                      {!canSeeAllMedia && photo.isApproved && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-5 h-5 text-green-500 bg-gray-800 rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
