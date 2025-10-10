'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  User, Save, AlertCircle, CheckCircle, Camera, Link2, 
  MapPin, Calendar, Ruler, Eye, Palette, Heart, Info
} from 'lucide-react'

interface FormData {
  stageName: string
  bio: string
  age: string
  city: string
  state: string
  height: string
  weight: string
  measurements: string
  hairColor: string
  eyeColor: string
  ethnicity: string
  bodyType: string
  bustSize: string
  cupSize: string
  bodyHair: string
  tattoos: boolean
  tattoosDescription: string
  piercings: boolean
  piercingsDescription: string
  sexualOrientation: string
  willingToTravel: boolean
  availability: string
  experience: string[]
  jobTypes: string[]
  phone: string
  instagram: string
  twitter: string
  website: string
  onlyfans: string
  pornhubProfile: string
  xhamsterProfile: string
  redtubeProfile: string
}

export default function ProfileEditPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('basic')

  const [formData, setFormData] = useState<FormData>({
    stageName: '',
    bio: '',
    age: '',
    city: 'Houston',
    state: 'Texas',
    height: '',
    weight: '',
    measurements: '',
    hairColor: '',
    eyeColor: '',
    ethnicity: '',
    bodyType: '',
    bustSize: '',
    cupSize: '',
    bodyHair: '',
    tattoos: false,
    tattoosDescription: '',
    piercings: false,
    piercingsDescription: '',
    sexualOrientation: '',
    willingToTravel: false,
    availability: '',
    experience: [],
    jobTypes: [],
    phone: '',
    instagram: '',
    twitter: '',
    website: '',
    onlyfans: '',
    pornhubProfile: '',
    xhamsterProfile: '',
    redtubeProfile: '',
  })

  // Job type options
  const jobTypeOptions = [
    { value: 'softcore', label: 'Soft Core / Nude Modeling' },
    { value: 'modeling', label: 'Fashion/Glamour Modeling' },
    { value: 'hardcore', label: 'Hardcore Scenes' },
    { value: 'boy-girl', label: 'Boy/Girl Scenes' },
    { value: 'girl-girl', label: 'Girl/Girl Scenes' },
    { value: 'boy-boy', label: 'Boy/Boy Scenes' },
    { value: 'threesome', label: 'Threesome/Group' },
    { value: 'gangbang', label: 'Gangbang/Orgy' },
    { value: 'fetish', label: 'Fetish/BDSM' },
    { value: 'milf', label: 'MILF/Mature' },
    { value: 'trans', label: 'Trans Content' },
    { value: 'escorting', label: 'Escorting/Companionship' },
    { value: 'camming', label: 'Cam Shows/Live Streaming' },
    { value: 'custom', label: 'Custom Content' },
    { value: 'dancing', label: 'Exotic Dancing/Stripping' },
  ]

  // Physical attribute options
  const bodyTypeOptions = ['Athletic', 'Slim', 'Average', 'Curvy', 'BBW', 'Muscular', 'Dad Bod', 'Twink', 'Bear']
  const hairColorOptions = ['Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray', 'Colored/Dyed', 'Bald']
  const eyeColorOptions = ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber']
  const ethnicityOptions = ['White/Caucasian', 'Black/African American', 'Hispanic/Latino', 'Asian', 'Middle Eastern', 'Native American', 'Pacific Islander', 'Mixed/Other']
  const bodyHairOptions = ['Fully Shaved/Bare', 'Trimmed', 'Natural', 'Landing Strip', 'Partially Shaved']
  const orientationOptions = ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Curious', 'Open']
  const bustSizeOptions = ['30', '32', '34', '36', '38', '40', '42', '44+']
  const cupSizeOptions = ['A', 'B', 'C', 'D', 'DD', 'DDD/E', 'F', 'G+']

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      loadProfile()
    }
  }, [status, router])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setFormData(prev => ({
            ...prev,
            ...data.profile,
            jobTypes: data.profile.jobTypes || [],
            experience: data.profile.experience || [],
          }))
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleJobTypeToggle = (jobType: string) => {
    setFormData(prev => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(jobType)
        ? prev.jobTypes.filter(j => j !== jobType)
        : [...prev.jobTypes, jobType]
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to update profile')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
              <p className="text-gray-400 mt-1">Update your talent profile information</p>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-600 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <p className="text-green-200">Profile updated successfully!</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('basic')}
            className={`pb-3 px-1 ${activeTab === 'basic' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('physical')}
            className={`pb-3 px-1 ${activeTab === 'physical' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
          >
            Physical Attributes
          </button>
          <button
            onClick={() => setActiveTab('professional')}
            className={`pb-3 px-1 ${activeTab === 'professional' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
          >
            Professional
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`pb-3 px-1 ${activeTab === 'links' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
          >
            Links & Platforms
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="bg-gray-800 rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stage/Professional Name
                  </label>
                  <input
                    type="text"
                    name="stageName"
                    value={formData.stageName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Your professional name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="18"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio / About Me
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Tell producers about yourself..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sexual Orientation
                </label>
                <select
                  name="sexualOrientation"
                  value={formData.sexualOrientation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select orientation</option>
                  {orientationOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Physical Attributes Tab */}
          {activeTab === 'physical' && (
            <div className="bg-gray-800 rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Physical Attributes</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Body Type
                  </label>
                  <select
                    name="bodyType"
                    value={formData.bodyType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Select body type</option>
                    {bodyTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Height
                  </label>
                  <input
                    type="text"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder='e.g., 5\'7"'
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hair Color
                  </label>
                  <select
                    name="hairColor"
                    value={formData.hairColor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Select hair color</option>
                    {hairColorOptions.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Eye Color
                  </label>
                  <select
                    name="eyeColor"
                    value={formData.eyeColor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Select eye color</option>
                    {eyeColorOptions.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bust Size (Band)
                  </label>
                  <select
                    name="bustSize"
                    value={formData.bustSize}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Select size</option>
                    {bustSizeOptions.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cup Size
                  </label>
                  <select
                    name="cupSize"
                    value={formData.cupSize}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Select cup size</option>
                    {cupSizeOptions.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Body Hair / Grooming
                </label>
                <select
                  name="bodyHair"
                  value={formData.bodyHair}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select grooming style</option>
                  {bodyHairOptions.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ethnicity
                </label>
                <select
                  name="ethnicity"
                  value={formData.ethnicity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select ethnicity</option>
                  {ethnicityOptions.map(eth => (
                    <option key={eth} value={eth}>{eth}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="tattoos"
                    name="tattoos"
                    checked={formData.tattoos}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <label htmlFor="tattoos" className="ml-2 text-gray-300">
                    I have tattoos
                  </label>
                </div>
                
                {formData.tattoos && (
                  <input
                    type="text"
                    name="tattoosDescription"
                    value={formData.tattoosDescription}
                    onChange={handleInputChange}
                    placeholder="Describe your tattoos (location, size, etc.)"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                )}
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="piercings"
                    name="piercings"
                    checked={formData.piercings}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <label htmlFor="piercings" className="ml-2 text-gray-300">
                    I have piercings
                  </label>
                </div>
                
                {formData.piercings && (
                  <input
                    type="text"
                    name="piercingsDescription"
                    value={formData.piercingsDescription}
                    onChange={handleInputChange}
                    placeholder="Describe your piercings (ears, nose, nipples, etc.)"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Measurements (Optional)
                </label>
                <input
                  type="text"
                  name="measurements"
                  value={formData.measurements}
                  onChange={handleInputChange}
                  placeholder="e.g., 36-24-36"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            </div>
          )}

          {/* Professional Tab */}
          {activeTab === 'professional' && (
            <div className="bg-gray-800 rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Professional Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Types of Work Interested In
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {jobTypeOptions.map(job => (
                    <div key={job.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={job.value}
                        checked={formData.jobTypes.includes(job.value)}
                        onChange={() => handleJobTypeToggle(job.value)}
                        className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded"
                      />
                      <label htmlFor={job.value} className="ml-2 text-gray-300">
                        {job.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Availability
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select availability</option>
                  <option value="Weekdays">Weekdays</option>
                  <option value="Weekends">Weekends</option>
                  <option value="Evenings">Evenings</option>
                  <option value="Flexible">Flexible</option>
                  <option value="By Appointment">By Appointment Only</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="travel"
                  name="willingToTravel"
                  checked={formData.willingToTravel}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded"
                />
                <label htmlFor="travel" className="ml-2 text-gray-300">
                  Willing to travel for work
                </label>
              </div>
            </div>
          )}

          {/* Links & Platforms Tab */}
          {activeTab === 'links' && (
            <div className="bg-gray-800 rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Links & Adult Platforms</h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Adult Platforms</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    OnlyFans URL
                  </label>
                  <input
                    type="url"
                    name="onlyfans"
                    value={formData.onlyfans}
                    onChange={handleInputChange}
                    placeholder="https://onlyfans.com/yourprofile"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    PornHub Profile
                  </label>
                  <input
                    type="url"
                    name="pornhubProfile"
                    value={formData.pornhubProfile}
                    onChange={handleInputChange}
                    placeholder="https://pornhub.com/model/yourname"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    XHamster Profile
                  </label>
                  <input
                    type="url"
                    name="xhamsterProfile"
                    value={formData.xhamsterProfile}
                    onChange={handleInputChange}
                    placeholder="https://xhamster.com/creators/yourname"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    RedTube Profile
                  </label>
                  <input
                    type="url"
                    name="redtubeProfile"
                    value={formData.redtubeProfile}
                    onChange={handleInputChange}
                    placeholder="https://redtube.com/profile/yourname"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-medium text-white">Social Media</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder="@yourusername"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Twitter/X Handle
                    </label>
                    <input
                      type="text"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      placeholder="@yourusername"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Personal Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium py-3 px-8 rounded-lg transition duration-200 flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
