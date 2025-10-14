// app/talent/[username]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import {
  MapPin,
  Ruler,
  Palette,
  Instagram,
  Globe,
  ArrowLeft,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  Lock
} from 'lucide-react'

interface PageProps {
  params: { username: string }
}

export default async function TalentProfilePage({ params }: PageProps) {
  // Get current session to check if user is viewing their own profile
  const session = await getServerSession(authOptions)

  const user = await prisma.user.findUnique({
    where: {
      username: params.username.toLowerCase()
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

  // Check if this is the user's own profile (or admin viewing)
  const sessionUsername = session?.user?.username?.toLowerCase()
  const isOwnProfile = session?.user?.id === user.id || sessionUsername === user.username.toLowerCase()
  const isAdmin = session?.user?.role === 'ADMIN'

  // Decide which media to show
  const visibleMedia = (isOwnProfile || isAdmin)
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
        {isOwnProfile && visibleMedia.some((m: any) => !m.isApproved) && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <p className="text-yellow-200 font-medium">Some photos are pending approval</p>
                <p className="text-yellow-200/80 text-sm mt-1">
                  Photos marked with a clock icon are waiting for admin approval and are only visible to you.
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
                    {(isOwnProfile || isAdmin) && (
                      <div className="absolute top-3 left-3 flex gap-2">
                        {!profilePhoto.isApproved && (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-500/20 text-yellow-200 text-xs">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                          </span>
                        )}
                        {!profilePhoto.isPublic && (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-gray-900/60 text-gray-100 text-xs">
                            <Lock className="w-3 h-3 mr-1" /> Private
                          </span>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No profile photo</div>
                )}
              </div>

              {/* Basic Info */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                    {user.profile?.stageName || user.username}
                    {isVerified && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </h1>
                </div>

                <div className="space-y-2 text-sm">
                  {user.profile?.city && user.profile?.state && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {user.profile.city}, {user.profile.state}
                      </span>
                    </div>
                  )}
                  {user.profile?.height && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Ruler className="w-4 h-4" />
                      <span>
                        {user.profile.height}
                        {user.profile.weight ? ` • ${user.profile.weight}` : ''}
                      </span>
                    </div>
                  )}
                  {(user.profile?.hairColor || user.profile?.eyeColor) && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Palette className="w-4 h-4" />
                      <span>
                        {user.profile?.hairColor ? `Hair: ${user.profile.hairColor}` : ''}
                        {user.profile?.hairColor && user.profile?.eyeColor ? ' • ' : ''}
                        {user.profile?.eyeColor ? `Eyes: ${user.profile.eyeColor}` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Links */}
                {(user.profile?.instagram || user.profile?.website) && (
                  <div className="pt-3 border-t border-gray-700/60 flex gap-3">
                    {user.profile?.instagram && (
                      <a
                        href={user.profile.instagram.startsWith('http')
                          ? user.profile.instagram
                          : `https://instagram.com/${user.profile.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-pink-300 hover:text-pink-200"
                      >
                        <Instagram className="w-4 h-4" />
                        <span>Instagram</span>
                      </a>
                    )}
                    {user.profile?.website && (
                      <a
                        href={user.profile.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* About / Bio */}
            {(user.profile?.bio || isOwnProfile) && (
              <div className="bg-gray-800 rounded-lg mt-6 p-5">
                <h2 className="text-white font-semibold mb-2">About</h2>
                {user.profile?.bio ? (
                  <p className="text-gray-300 whitespace-pre-line">{user.profile.bio}</p>
                ) : (
                  isOwnProfile && (
                    <p className="text-gray-400 text-sm">
                      Add a short bio in your profile so people can learn more about you.
                    </p>
                  )
                )}
              </div>
            )}
          </div>

          {/* Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Gallery</h2>
                {(isOwnProfile || isAdmin) && (
                  <div className="text-xs text-gray-400 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                    <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Private</span>
                  </div>
                )}
              </div>

              {galleryPhotos.length === 0 ? (
                <div className="text-gray-400 text-sm">No photos to display.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {galleryPhotos.map((m: any) => (
                    <div key={m.id} className="relative group rounded-lg overflow-hidden bg-gray-700">
                      <img src={m.url} alt={user.profile?.stageName || user.username} className="w-full h-48 object-cover" />

                      {(isOwnProfile || isAdmin) && (
                        <div className="absolute top-2 left-2 flex gap-2">
                          {!m.isApproved && (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-500/20 text-yellow-200 text-[10px]">
                              <Clock className="w-3 h-3 mr-1" /> Pending
                            </span>
                          )}
                          {!m.isPublic && (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-900/60 text-gray-100 text-[10px]">
                              <Lock className="w-3 h-3 mr-1" /> Private
                            </span>
                          )}
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
