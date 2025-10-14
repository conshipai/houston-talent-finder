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
  
  const user = await prisma.user.findUnique({
    where: {
      username: params.username.toLowerCase()
    },
    include: {
      profile: true,
      media: {
        where: session?.user?.id === params.username.toLowerCase() || session?.user?.username === params.username.toLowerCase()
          ? {} // If viewing own profile, show all media
          : { // Otherwise only show approved public media
              isApproved: true,
              isPublic: true
            },
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
  const isOwnProfile = session?.user?.id === user.id || session?.user?.username === user.username
  const isAdmin = session?.user?.role === 'ADMIN'
  
  const profilePhoto = user.media.find(m => m.isProfilePhoto)
  const galleryPhotos = user.media.filter(m => !m.isProfilePhoto)
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
        {isOwnProfile && user.media.some(m => !m.isApproved) && (
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
                    {/* Show approval status if own profile */}
                    {isOwnProfile && !profilePhoto.isApproved && (
                      <div className="absolute top-2 right-2 bg-yellow-600 text-white px-2 py-1 rounded flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span className="text-xs">Pending</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-4" />
                      <p className="text-gray-400">No photo yet</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-white">
                    {user.profile?.stageName || user.username}
                  </h1>
                  {isVerified && (
                    <div title="Verified">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                  )}
                </div>
                
                {user.profile?.bio && (
                  <p className="text-gray-300 mb-6">{user.profile.bio}</p>
                )}
                
                {/* Details */}
                <div className="space-y-3">
                  {user.profile?.city && (
                    <div className="flex items-center text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{user.profile.city}, {user.profile.state}</span>
                    </div>
                  )}
                  
                  {user.profile?.age && (
                    <div className="flex items-center text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{user.profile.age} years old</span>
                    </div>
                  )}
                  
                  {user.profile?.height && (
                    <div className="flex items-center text-gray-400">
                      <Ruler className="w-4 h-4 mr-2" />
                      <span>{user.profile.height}</span>
                    </div>
                  )}
                  
                  {user.profile?.eyeColor && (
                    <div className="flex items-center text-gray-400">
                      <Eye className="w-4 h-4 mr-2" />
                      <span>{user.profile.eyeColor} eyes</span>
                    </div>
                  )}
                  
                  {user.profile?.hairColor && (
                    <div className="flex items-center text-gray-400">
                      <Palette className="w-4 h-4 mr-2" />
                      <span>{user.profile.hairColor} hair</span>
                    </div>
                  )}
                </div>
                
                {/* Categories */}
                {user.profile?.categories && user.profile.categories.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.profile.categories.map((cat, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Social Links */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex space-x-3">
                    {user.profile?.instagram && (
                      <a
                        href={`https://instagram.com/${user.profile.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {user.profile?.website && (
                      <a
                        href={user.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white"
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Info */}
            {user.profile && (
              <div className="bg-gray-800 rounded-lg p-6 mt-4">
                <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
                <dl className="space-y-2">
                  {user.profile.measurements && (
                    <>
                      <dt className="text-sm text-gray-400">Measurements</dt>
                      <dd className="text-white mb-3">{user.profile.measurements}</dd>
                    </>
                  )}
                  {user.profile.ethnicity && (
                    <>
                      <dt className="text-sm text-gray-400">Ethnicity</dt>
                      <dd className="text-white mb-3">{user.profile.ethnicity}</dd>
                    </>
                  )}
                  {user.profile.availability && (
                    <>
                      <dt className="text-sm text-gray-400">Availability</dt>
                      <dd className="text-white mb-3">{user.profile.availability}</dd>
                    </>
                  )}
                  <dt className="text-sm text-gray-400">Travel</dt>
                  <dd className="text-white">
                    {user.profile.willingToTravel ? 'Yes' : 'Local only'}
                  </dd>
                </dl>
              </div>
            )}
          </div>
          
          {/* Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Portfolio ({galleryPhotos.length} photos)
                </h2>
                {isOwnProfile && (
                  <Link
                    href="/media"
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Manage Photos →
                  </Link>
                )}
              </div>
              
              {galleryPhotos.length === 0 ? (
                <div className="text-center py-12">
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
                  {galleryPhotos.map((photo) => (
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
                      {isOwnProfile && (
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
                            <div className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                              18+
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Show approved badge for others */}
                      {!isOwnProfile && photo.isApproved && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-5 h-5 text-green-500 bg-gray-800 rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Experience */}
            {user.profile?.experience && user.profile.experience.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Experience</h3>
                <ul className="space-y-2">
                  {user.profile.experience.map((exp, index) => (
                    <li key={index} className="text-gray-300 flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {exp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Specialties */}
            {user.profile?.specialties && user.profile.specialties.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {user.profile.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
