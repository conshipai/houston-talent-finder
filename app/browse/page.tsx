// app/browse/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Search, Filter, MapPin, Heart, Briefcase, User, 
  ChevronLeft, ChevronRight, Grid, List, CheckCircle,
  Calendar, Eye
} from 'lucide-react'

interface TalentProfile {
  id: string
  username: string
  profile: {
    stageName: string | null
    bio: string | null
    age: number | null
    city: string
    state: string
    verified: boolean
    bodyType: string | null
    hairColor: string | null
    ethnicity: string | null
    sexualOrientation: string | null
    jobTypes: string[]
    bustSize: string | null
    cupSize: string | null
  } | null
  media: {
    id: string
    url: string
    thumbnailUrl: string | null
    isProfilePhoto: boolean
  }[]
}

export default function BrowsePage() {
  const router = useRouter()
  const [talents, setTalents] = useState<TalentProfile[]>([])
  const [filteredTalents, setFilteredTalents] = useState<TalentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedOrientation, setSelectedOrientation] = useState('')
  const [selectedBodyType, setSelectedBodyType] = useState('')
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [selectedEthnicity, setSelectedEthnicity] = useState('')
  const [ageRange, setAgeRange] = useState({ min: 18, max: 99 })

  // Filter options
  const jobTypeOptions = [
    { value: 'softcore', label: 'Soft Core' },
    { value: 'modeling', label: 'Modeling' },
    { value: 'hardcore', label: 'Hardcore' },
    { value: 'boy-girl', label: 'Boy/Girl' },
    { value: 'girl-girl', label: 'Girl/Girl' },
    { value: 'threesome', label: 'Group Scenes' },
    { value: 'fetish', label: 'Fetish/BDSM' },
    { value: 'escorting', label: 'Escorting' },
    { value: 'camming', label: 'Cam Shows' },
    { value: 'custom', label: 'Custom Content' },
    { value: 'dancing', label: 'Dancing' }
  ]

  const bodyTypeOptions = ['Athletic', 'Slim', 'Average', 'Curvy', 'BBW', 'Muscular']
  const orientationOptions = ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Open']
  const ethnicityOptions = ['White/Caucasian', 'Black/African American', 'Hispanic/Latino', 'Asian', 'Middle Eastern', 'Mixed/Other']

  useEffect(() => {
    loadTalents()
  }, [currentPage])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, selectedCity, selectedOrientation, selectedBodyType, selectedJobTypes, selectedEthnicity, ageRange, talents])

  const loadTalents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/talents?page=${currentPage}&limit=12`)
      if (response.ok) {
        const data = await response.json()
        setTalents(data.talents || [])
        setTotalPages(data.totalPages || 1)
        setFilteredTalents(data.talents || [])
      }
    } catch (error) {
      console.error('Error loading talents:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...talents]

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(talent => 
        talent.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        talent.profile?.stageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        talent.profile?.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(talent => 
        talent.profile?.city.toLowerCase().includes(selectedCity.toLowerCase())
      )
    }

    // Orientation filter
    if (selectedOrientation) {
      filtered = filtered.filter(talent => 
        talent.profile?.sexualOrientation === selectedOrientation
      )
    }

    // Body type filter
    if (selectedBodyType) {
      filtered = filtered.filter(talent => 
        talent.profile?.bodyType === selectedBodyType
      )
    }

    // Ethnicity filter
    if (selectedEthnicity) {
      filtered = filtered.filter(talent => 
        talent.profile?.ethnicity === selectedEthnicity
      )
    }

    // Job types filter
    if (selectedJobTypes.length > 0) {
      filtered = filtered.filter(talent => 
        talent.profile?.jobTypes && 
        selectedJobTypes.some(jobType => talent.profile?.jobTypes.includes(jobType))
      )
    }

    // Age filter
    filtered = filtered.filter(talent => {
      const age = talent.profile?.age
      if (!age) return true
      return age >= ageRange.min && age <= ageRange.max
    })

    setFilteredTalents(filtered)
  }

  const toggleJobType = (jobType: string) => {
    setSelectedJobTypes(prev => 
      prev.includes(jobType) 
        ? prev.filter(j => j !== jobType)
        : [...prev, jobType]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCity('')
    setSelectedOrientation('')
    setSelectedBodyType('')
    setSelectedJobTypes([])
    setSelectedEthnicity('')
    setAgeRange({ min: 18, max: 99 })
  }

  const getProfilePhoto = (talent: TalentProfile) => {
    return talent.media.find(m => m.isProfilePhoto) || talent.media[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-white font-bold text-xl">
                Houston Talent Finder
              </Link>
              <span className="text-gray-400">|</span>
              <h1 className="text-white text-lg">Browse Talent</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {(selectedJobTypes.length > 0 || selectedOrientation || selectedBodyType) && (
                  <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {selectedJobTypes.length + (selectedOrientation ? 1 : 0) + (selectedBodyType ? 1 : 0)}
                  </span>
                )}
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, bio, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                <input
                  type="text"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  placeholder="e.g., Houston"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                />
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Orientation</label>
                <select
                  value={selectedOrientation}
                  onChange={(e) => setSelectedOrientation(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                >
                  <option value="">All</option>
                  {orientationOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Body Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Body Type</label>
                <select
                  value={selectedBodyType}
                  onChange={(e) => setSelectedBodyType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                >
                  <option value="">All</option>
                  {bodyTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Ethnicity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ethnicity</label>
                <select
                  value={selectedEthnicity}
                  onChange={(e) => setSelectedEthnicity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                >
                  <option value="">All</option>
                  {ethnicityOptions.map(eth => (
                    <option key={eth} value={eth}>{eth}</option>
                  ))}
                </select>
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={ageRange.min}
                    onChange={(e) => setAgeRange({...ageRange, min: parseInt(e.target.value)})}
                    className="w-1/2 px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                  />
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={ageRange.max}
                    onChange={(e) => setAgeRange({...ageRange, max: parseInt(e.target.value)})}
                    className="w-1/2 px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Job Types */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Services/Job Types</label>
              <div className="flex flex-wrap gap-2">
                {jobTypeOptions.map(job => (
                  <button
                    key={job.value}
                    onClick={() => toggleJobType(job.value)}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      selectedJobTypes.includes(job.value)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {job.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <p className="text-gray-400">
          Showing {filteredTalents.length} talent{filteredTalents.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Talents Grid/List */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-white text-xl">Loading talents...</div>
          </div>
        ) : filteredTalents.length === 0 ? (
          <div className="text-center py-20">
            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No talents found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredTalents.map(talent => {
              const profilePhoto = getProfilePhoto(talent)
              
              return viewMode === 'grid' ? (
                // Grid View
                <Link
                  key={talent.id}
                  href={`/talent/${talent.username}`}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-600 transition group"
                >
                  <div className="aspect-square bg-gray-700 relative">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto.thumbnailUrl || profilePhoto.url}
                        alt={talent.profile?.stageName || talent.username}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-600" />
                      </div>
                    )}
                    {talent.profile?.verified && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white p-1 rounded-full">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium">
                        View Profile
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white text-lg">
                      {talent.profile?.stageName || talent.username}
                    </h3>
                    <div className="flex items-center text-gray-400 text-sm mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {talent.profile?.city}, {talent.profile?.state}
                    </div>
                    {talent.profile?.age && (
                      <div className="flex items-center text-gray-400 text-sm mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {talent.profile.age} years old
                      </div>
                    )}
                    {talent.profile?.sexualOrientation && (
                      <div className="flex items-center text-gray-400 text-sm mt-1">
                        <Heart className="w-3 h-3 mr-1" />
                        {talent.profile.sexualOrientation}
                      </div>
                    )}
                    {talent.profile?.jobTypes && talent.profile.jobTypes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {talent.profile.jobTypes.slice(0, 3).map(job => (
                          <span key={job} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                            {job}
                          </span>
                        ))}
                        {talent.profile.jobTypes.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{talent.profile.jobTypes.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                // List View
                <Link
                  key={talent.id}
                  href={`/talent/${talent.username}`}
                  className="bg-gray-800 rounded-lg p-6 hover:ring-2 hover:ring-red-600 transition flex space-x-6"
                >
                  <div className="w-32 h-32 bg-gray-700 rounded-lg flex-shrink-0">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto.thumbnailUrl || profilePhoto.url}
                        alt={talent.profile?.stageName || talent.username}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white text-xl flex items-center">
                          {talent.profile?.stageName || talent.username}
                          {talent.profile?.verified && (
                            <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                          )}
                        </h3>
                        <div className="flex items-center space-x-4 text-gray-400 text-sm mt-1">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {talent.profile?.city}, {talent.profile?.state}
                          </span>
                          {talent.profile?.age && (
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {talent.profile.age} years old
                            </span>
                          )}
                          {talent.profile?.sexualOrientation && (
                            <span className="flex items-center">
                              <Heart className="w-3 h-3 mr-1" />
                              {talent.profile.sexualOrientation}
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        View Profile
                      </button>
                    </div>
                    {talent.profile?.bio && (
                      <p className="text-gray-300 text-sm mt-3 line-clamp-2">
                        {talent.profile.bio}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-3 text-sm">
                      {talent.profile?.bodyType && (
                        <span className="text-gray-400">
                          Body: <span className="text-gray-300">{talent.profile.bodyType}</span>
                        </span>
                      )}
                      {talent.profile?.ethnicity && (
                        <span className="text-gray-400">
                          Ethnicity: <span className="text-gray-300">{talent.profile.ethnicity}</span>
                        </span>
                      )}
                      {talent.profile?.bustSize && talent.profile?.cupSize && (
                        <span className="text-gray-400">
                          Bust: <span className="text-gray-300">{talent.profile.bustSize}{talent.profile.cupSize}</span>
                        </span>
                      )}
                    </div>
                    {talent.profile?.jobTypes && talent.profile.jobTypes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {talent.profile.jobTypes.map(job => (
                          <span key={job} className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
                            {job}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex space-x-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
