// app/talent/[username]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import {
  MapPin, Calendar, Ruler, Eye, Palette,
  ArrowLeft, MessageSquare, CheckCircle,
  AlertCircle, Clock, Lock
} from 'lucide-react'
import { buildImageRequestPath } from '@/lib/media'

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

  const normalizedMedia = user.media.map((media: any) => ({
    ...media,
    url:
      buildImageRequestPath(media.url) ??
      buildImageRequestPath(media.filename) ??
      media.url,
    thumbnailUrl: buildImageRequestPath(media.thumbnailUrl) ?? media.thumbnailUrl,
  }))
  
  const visibleMedia = canSeeAllMedia
     ? normalizedMedia
    : normalizedMedia.filter((m: any) => m.isApproved && m.isPublic)

  const profilePhoto = visibleMedia.find((m: any) => m.isProfilePhoto)
  const galleryPhotos = visibleMedia.filter((m: any) => !m.isProfilePhoto)
  const isVerified = user.profile?.verified

  const profile = user.profile
  const location = [profile?.city, profile?.state].filter(Boolean).join(', ')
  const formatList = (values?: string[] | null) =>
    values && values.length > 0 ? values.join(', ') : null
  const formatLink = (url?: string | null) => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `https://${url}`
  }
  const customLinks = Array.isArray(profile?.customLinks)
    ? (profile?.customLinks as { platform?: string; url?: string }[]).filter(
        (link) => link?.url
      )
    : []

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
            
            {(profile?.stageName ||
              profile?.bio ||
              location ||
              profile?.age ||
              profile?.height ||
              profile?.weight ||
              profile?.measurements ||
              profile?.hairColor ||
              profile?.eyeColor ||
              profile?.ethnicity ||
              profile?.bodyType ||
              profile?.bustSize ||
              profile?.cupSize ||
              profile?.experience?.length ||
              profile?.jobTypes?.length ||
              profile?.categories?.length ||
              profile?.specialties?.length ||
              profile?.availability ||
              profile?.willingToTravel ||
              profile?.sexualOrientation ||
              profile?.instagram ||
              profile?.twitter ||
              profile?.website ||
              profile?.onlyfans ||
              profile?.pornhubProfile ||
              profile?.xhamsterProfile ||
              profile?.redtubeProfile ||
              profile?.phone ||
              customLinks.length) && (
              <div className="mt-6 space-y-6">
                <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Stage Name</p>
                      <p className="text-xl font-semibold text-white">
                        {profile?.stageName || user.username}
                      </p>
                    </div>
                    {isVerified && (
                      <span className="inline-flex items-center space-x-1 bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-300 space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{location || 'Location not provided'}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-300 space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {profile?.bio && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Bio</p>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                        {profile.bio}
                      </p>
                    </div>
                  )}
                </div>

                {(profile?.age ||
                  profile?.height ||
                  profile?.weight ||
                  profile?.measurements ||
                  profile?.hairColor ||
                  profile?.eyeColor ||
                  profile?.ethnicity ||
                  profile?.bodyType ||
                  profile?.bustSize ||
                  profile?.cupSize ||
                  profile?.tattoos ||
                  profile?.piercings) && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                      <Ruler className="w-4 h-4 text-gray-400" />
                      <span>Physical Attributes</span>
                    </h3>
                    <dl className="grid grid-cols-1 gap-3 text-sm text-gray-300">
                      {profile?.age && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400">Age</dt>
                          <dd>{profile.age}</dd>
                        </div>
                      )}
                      {profile?.height && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400">Height</dt>
                          <dd>{profile.height}</dd>
                        </div>
                      )}
                      {profile?.weight && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400">Weight</dt>
                          <dd>{profile.weight}</dd>
                        </div>
                      )}
                      {profile?.measurements && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400">Measurements</dt>
                          <dd>{profile.measurements}</dd>
                        </div>
                      )}
                      {profile?.hairColor && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400">Hair Color</dt>
                          <dd>{profile.hairColor}</dd>
                        </div>
                      )}
                      {profile?.eyeColor && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400">Eye Color</dt>
                          <dd>{profile.eyeColor}</dd>
                        </div>
                      )}
                      {profile?.ethnicity && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400">Ethnicity</dt>
                          <dd>{profile.ethnicity}</dd>
                        </div>
                      )}
                      {profile?.bodyType && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400">Body Type</dt>
                          <dd>{profile.bodyType}</dd>
                        </div>
                      )}
                      {(profile?.bustSize || profile?.cupSize) && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400">Bust / Cup</dt>
                          <dd>{[profile?.bustSize, profile?.cupSize].filter(Boolean).join(' ')}</dd>
                        </div>
                      )}
                      {profile?.tattoos !== undefined && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400">Tattoos</dt>
                          <dd>{profile.tattoos ? 'Yes' : 'No'}</dd>
                        </div>
                      )}
                      {profile?.piercings !== undefined && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400">Piercings</dt>
                          <dd>{profile.piercings ? 'Yes' : 'No'}</dd>
                        </div>
                      )}
                    </dl>
                    {(profile?.tattoosDescription || profile?.piercingsDescription) && (
                      <div className="mt-3 text-xs text-gray-400 space-y-2">
                        {profile?.tattoosDescription && (
                          <p>Tattoos: {profile.tattoosDescription}</p>
                        )}
                        {profile?.piercingsDescription && (
                          <p>Piercings: {profile.piercingsDescription}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {(profile?.sexualOrientation ||
                  formatList(profile?.experience) ||
                  formatList(profile?.jobTypes) ||
                  formatList(profile?.categories) ||
                  formatList(profile?.specialties) ||
                  profile?.availability ||
                  profile?.willingToTravel) && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-gray-400" />
                      <span>Professional Details</span>
                    </h3>
                    <dl className="space-y-3 text-sm text-gray-300">
                      {profile?.sexualOrientation && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400">Orientation</dt>
                          <dd>{profile.sexualOrientation}</dd>
                        </div>
                      )}
                      {formatList(profile?.experience) && (
                        <div>
                          <dt className="text-gray-400">Experience</dt>
                          <dd>{formatList(profile?.experience)}</dd>
                        </div>
                      )}
                      {formatList(profile?.jobTypes) && (
                        <div>
                          <dt className="text-gray-400">Job Types</dt>
                          <dd>{formatList(profile?.jobTypes)}</dd>
                        </div>
                      )}
                      {formatList(profile?.categories) && (
                        <div>
                          <dt className="text-gray-400">Categories</dt>
                          <dd>{formatList(profile?.categories)}</dd>
                        </div>
                      )}
                      {formatList(profile?.specialties) && (
                        <div>
                          <dt className="text-gray-400">Specialties</dt>
                          <dd>{formatList(profile?.specialties)}</dd>
                        </div>
                      )}
                      {profile?.availability && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400">Availability</dt>
                          <dd>{profile.availability}</dd>
                        </div>
                      )}
                      {profile?.willingToTravel !== undefined && (
                        <div className="flex justify-between">
                          <dt className="text-gray-400">Willing to Travel</dt>
                          <dd>{profile.willingToTravel ? 'Yes' : 'No'}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {(profile?.phone ||
                  profile?.instagram ||
                  profile?.twitter ||
                  profile?.website ||
                  profile?.onlyfans ||
                  profile?.pornhubProfile ||
                  profile?.xhamsterProfile ||
                  profile?.redtubeProfile ||
                  customLinks.length) && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span>Contact & Social</span>
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-300">
                      {profile?.phone && (
                        <li className="flex justify-between">
                          <span className="text-gray-400">Phone</span>
                          <span>{profile.phone}</span>
                        </li>
                      )}
                      {profile?.instagram && formatLink(profile.instagram) && (
                        <li className="flex justify-between items-center">
                          <span className="text-gray-400">Instagram</span>
                          <a
                            href={formatLink(profile.instagram)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300"
                          >
                            {profile.instagram}
                          </a>
                        </li>
                      )}
                      {profile?.twitter && formatLink(profile.twitter) && (
                        <li className="flex justify-between items-center">
                          <span className="text-gray-400">Twitter</span>
                          <a
                            href={formatLink(profile.twitter)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300"
                          >
                            {profile.twitter}
                          </a>
                        </li>
                      )}
                      {profile?.website && formatLink(profile.website) && (
                        <li className="flex justify-between items-center">
                          <span className="text-gray-400">Website</span>
                          <a
                            href={formatLink(profile.website)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300"
                          >
                            {profile.website}
                          </a>
                        </li>
                      )}
                      {profile?.onlyfans && formatLink(profile.onlyfans) && (
                        <li className="flex justify-between items-center">
                          <span className="text-gray-400">OnlyFans</span>
                          <a
                            href={formatLink(profile.onlyfans)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300"
                          >
                            {profile.onlyfans}
                          </a>
                        </li>
                      )}
                      {profile?.pornhubProfile && formatLink(profile.pornhubProfile) && (
                        <li className="flex justify-between items-center">
                          <span className="text-gray-400">Pornhub</span>
                          <a
                            href={formatLink(profile.pornhubProfile)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300"
                          >
                            {profile.pornhubProfile}
                          </a>
                        </li>
                      )}
                      {profile?.xhamsterProfile && formatLink(profile.xhamsterProfile) && (
                        <li className="flex justify-between items-center">
                          <span className="text-gray-400">XHamster</span>
                          <a
                            href={formatLink(profile.xhamsterProfile)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300"
                          >
                            {profile.xhamsterProfile}
                          </a>
                        </li>
                      )}
                      {profile?.redtubeProfile && formatLink(profile.redtubeProfile) && (
                        <li className="flex justify-between items-center">
                          <span className="text-gray-400">RedTube</span>
                          <a
                            href={formatLink(profile.redtubeProfile)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300"
                          >
                            {profile.redtubeProfile}
                          </a>
                        </li>
                      )}
                      {customLinks.map((link, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <span className="text-gray-400">{link.platform || 'Link'}</span>
                          <a
                            href={formatLink(link.url)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300"
                          >
                            {link.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
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
