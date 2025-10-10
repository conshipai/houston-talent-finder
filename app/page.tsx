// app/talent/[username]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { 
  MapPin, Calendar, Ruler, Eye, Palette, 
  Instagram, Globe, ArrowLeft, MessageSquare,
  CheckCircle, AlertCircle, Heart, User, Briefcase,
  Link2, ExternalLink, Info
} from 'lucide-react'

interface PageProps {
  params: { username: string }
}

export default async function TalentProfilePage({ params }: PageProps) {
  const user = await prisma.user.findUnique({
    where: {
      username: params.username.toLowerCase()
    },
    include: {
      profile: true,
      media: {
        where: {
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

  const profilePhoto = user.media.find(m => m.isProfilePhoto)
  const galleryPhotos = user.media.filter(m => !m.isProfilePhoto)
  const isVerified = user.profile?.verified

  // Job type labels mapping
  const jobTypeLabels: Record<string, string> = {
    'softcore': 'Soft Core / Nude Modeling',
    'modeling': 'Fashion/Glamour Modeling',
    'hardcore': 'Hardcore Scenes',
    'boy-girl': 'Boy/Girl Scenes',
    'girl-girl': 'Girl/Girl Scenes',
    'boy-boy': 'Boy/Boy Scenes',
    'threesome': 'Threesome/Group',
    'gangbang': 'Gangbang/Orgy',
    'fetish': 'Fetish/BDSM',
    'milf': 'MILF/Mature',
    'trans': 'Trans Content',
    'escorting': 'Escorting/Companionship',
    'camming': 'Cam Shows/Live Streaming',
    'custom': 'Custom Content',
    'dancing': 'Exotic Dancing/Stripping'
  }

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
            <Link
              href="/login"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              {/* Profile Photo */}
              <div className="aspect-square bg-gray-700">
                {profilePhoto ? (
                  <img
                    src={profilePhoto.url}
                    alt={user.profile?.stageName || user.username}
                    className="w-full h-full object-cover"
                  />
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
                
                {/* Quick Details */}
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
                  
                  {user.profile?.sexualOrientation && (
                    <div className="flex items-center text-gray-400">
                      <Heart className="w-4 h-4 mr-2" />
                      <span>{user.profile.sexualOrientation}</span>
                    </div>
                  )}
                </div>

                {/* Physical Attributes */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Physical Attributes</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {user.profile?.bodyType && (
                      <>
                        <span className="text-gray-500">Body Type:</span>
                        <span className="text-gray-300">{user.profile.bodyType}</span>
                      </>
                    )}
                    {user.profile?.hairColor && (
                      <>
                        <span className="text-gray-500">Hair:</span>
                        <span className="text-gray-300">{user.profile.hairColor}</span>
                      </>
                    )}
                    {user.profile?.eyeColor && (
                      <>
                        <span className="text-gray-500">Eyes:</span>
                        <span className="text-gray-300">{user.profile.eyeColor}</span>
                      </>
                    )}
                    {user.profile?.ethnicity && (
                      <>
                        <span className="text-gray-500">Ethnicity:</span>
                        <span className="text-gray-300">{user.profile.ethnicity}</span>
                      </>
                    )}
                    {user.profile?.bustSize && user.profile?.cupSize && (
                      <>
                        <span className="text-gray-500">Bust:</span>
                        <span className="text-gray-300">{user.profile.bustSize}{user.profile.cupSize}</span>
                      </>
                    )}
                    {user.profile?.bodyHair && (
                      <>
                        <span className="text-gray-500">Grooming:</span>
                        <span className="text-gray-300">{user.profile.bodyHair}</span>
                      </>
                    )}
                    {user.profile?.measurements && (
                      <>
                        <span className="text-gray-500">Measurements:</span>
                        <span className="text-gray-300">{user.profile.measurements}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Body Modifications */}
                {(user.profile?.tattoos || user.profile?.piercings) && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Body Modifications</h3>
                    <div className="space-y-2 text-sm">
                      {user.profile.tattoos && (
                        <div>
                          <span className="text-gray-300">✓ Has Tattoos</span>
                          {user.profile.tattoosDescription && (
                            <p className="text-gray-400 text-xs mt-1">{user.profile.tattoosDescription}</p>
                          )}
                        </div>
                      )}
                      {user.profile.piercings && (
                        <div>
                          <span className="text-gray-300">✓ Has Piercings</span>
                          {user.profile.piercingsDescription && (
                            <p className="text-gray-400 text-xs mt-1">{user.profile.piercingsDescription}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Social Links */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Social Media</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.profile?.instagram && (
                      <a
                        href={`https://instagram.com/${user.profile.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                      >
                        <Instagram className="w-3 h-3" />
                        <span>Instagram</span>
                      </a>
                    )}
                    {user.profile?.twitter && (
                      <a
                        href={`https://twitter.com/${user.profile.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                      >
                        <span>𝕏</span>
                      </a>
                    )}
                    {user.profile?.website && (
                      <a
                        href={user.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Info Card */}
            {user.profile && (
              <div className="bg-gray-800 rounded-lg p-6 mt-4">
                <h3 className="text-lg font-semibold text-white mb-4">Professional Info</h3>
                <dl className="space-y-2 text-sm">
                  {user.profile.availability && (
                    <>
                      <dt className="text-gray-400">Availability</dt>
                      <dd className="text-white mb-3">{user.profile.availability}</dd>
                    </>
                  )}
                  <dt className="text-gray-400">Travel</dt>
                  <dd className="text-white">
                    {user.profile.willingToTravel ? 'Willing to travel' : 'Local only'}
                  </dd>
                </dl>
              </div>
            )}
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Services/Job Types */}
            {user.profile?.jobTypes && user.profile.jobTypes.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Available For
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {user.profile.jobTypes.map((jobType) => (
                    <div key={jobType} className="flex items-center text-gray-300">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                      {jobTypeLabels[jobType] || jobType}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Adult Platform Links */}
            {(user.profile?.onlyfans || user.profile?.pornhubProfile || 
              user.profile?.xhamsterProfile || user.profile?.redtubeProfile) && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Link2 className="w-5 h-5 mr-2" />
                  Content Platforms
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.profile.onlyfans && (
                    <a
                      href={user.profile.onlyfans}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg flex items-center justify-between transition"
                    >
                      <span className="font-medium">OnlyFans</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {user.profile.pornhubProfile && (
                    <a
                      href={user.profile.pornhubProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-4 py-3 rounded-lg flex items-center justify-between transition"
                    >
                      <span className="font-medium">PornHub</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {user.profile.xhamsterProfile && (
                    <a
                      href={user.profile.xhamsterProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg flex items-center justify-between transition"
                    >
                      <span className="font-medium">XHamster</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {user.profile.redtubeProfile && (
                    <a
                      href={user.profile.redtubeProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-4 py-3 rounded-lg flex items-center justify-between transition"
                    >
                      <span className="font-medium">RedTube</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-4 flex items-start">
                  <Info className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                  External adult content platforms. You must be 18+ to visit these links.
                </p>
              </div>
            )}

            {/* Photo Gallery */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Portfolio ({galleryPhotos.length} photos)
              </h2>
              
              {galleryPhotos.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No portfolio photos yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square bg-gray-700 rounded-lg overflow-hidden relative group"
                    >
                      {photo.isExplicit && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded z-10">
                          18+
                        </div>
                      )}
                      <img
                        src={photo.thumbnailUrl || photo.url}
                        alt={photo.title || 'Portfolio photo'}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
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

        {/* Contact Notice */}
        <div className="mt-8 bg-yellow-900/20 border border-yellow-600 rounded-lg p-6 text-center">
          <h3 className="text-yellow-500 font-semibold mb-2">Interested in working with {user.profile?.stageName || user.username}?</h3>
          <p className="text-yellow-200 mb-4">
            Create a producer account to contact talent and book sessions.
          </p>
          <Link
            href="/login"
            className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            Sign In to Contact
          </Link>
        </div>
      </div>
    </div>
  )
}
