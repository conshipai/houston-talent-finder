'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Search, Filter, Mail, Eye, ChevronLeft, ChevronRight, Camera,
  CheckCircle, XCircle, MessageSquare, Phone, MapPin, User as UserIcon, X
} from 'lucide-react'

interface User {
  id: string
  username: string
  email: string
  role: 'TALENT' | 'PRODUCER' | 'ADMIN'
  createdAt: string
  profile: {
    stageName: string | null
    phone: string | null
    age: number | null
    city: string | null
    state: string | null
    bio: string | null
    sexualOrientation: string | null
    bodyType: string | null
    height: string | null
    weight: string | null
    hairColor: string | null
    eyeColor: string | null
    ethnicity: string | null
    jobTypes: string[]
    availability: string | null
    willingToTravel: boolean
    instagram: string | null
    twitter: string | null
    website: string | null
    onlyfans: string | null
    verified: boolean
    active: boolean
    updatedAt: string
  } | null
  media: { url: string; thumbnailUrl: string | null }[]
  _count: {
    media: number
    sentMessages: number
    receivedMessages: number
  }
}

interface RoleCounts {
  TALENT: number
  PRODUCER: number
  ADMIN: number
  total: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalMatches, setTotalMatches] = useState(0)
  const [counts, setCounts] = useState<RoleCounts>({ TALENT: 0, PRODUCER: 0, ADMIN: 0, total: 0 })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Check admin once
  useEffect(() => {
    fetch('/api/admin/verify')
      .then(res => (res.ok ? setIsAdmin(true) : router.push('/dashboard')))
      .catch(() => router.push('/dashboard'))
  }, [router])

  // Wait until typing pauses before searching
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim())
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    if (isAdmin) loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, currentPage, selectedRole, debouncedSearch])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      if (selectedRole !== 'all') params.append('role', selectedRole)
      if (debouncedSearch) params.append('q', debouncedSearch)

      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        setTotalPages(data.pages || 1)
        setTotalMatches(data.total || 0)
        if (data.counts) setCounts(data.counts)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = (user: User) => {
    router.push(`/admin/messages?to=${user.username}`)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-600 text-white'
      case 'PRODUCER':
        return 'bg-blue-600 text-white'
      case 'TALENT':
        return 'bg-purple-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const photoOf = (user: User) => user.media[0]?.thumbnailUrl || user.media[0]?.url || null

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading users...</div>
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
              <Users className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-white">All Users</h1>
                <p className="text-gray-400 text-sm">Manage all platform users</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="text-gray-400 hover:text-white"
            >
              Back to Admin Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats (whole site, not just this page) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white">{counts.total}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-600">
            <p className="text-gray-400 text-sm">Talent</p>
            <p className="text-2xl font-bold text-purple-500">{counts.TALENT}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-blue-600">
            <p className="text-gray-400 text-sm">Producers</p>
            <p className="text-2xl font-bold text-blue-500">{counts.PRODUCER}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-red-600">
            <p className="text-gray-400 text-sm">Admins</p>
            <p className="text-2xl font-bold text-red-500">{counts.ADMIN}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by stage name, username, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value)
                  setCurrentPage(1)
                }}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="all">All Roles</option>
                <option value="TALENT">Talent Only</option>
                <option value="PRODUCER">Producers Only</option>
                <option value="ADMIN">Admins Only</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {loading ? 'Searching…' : `${totalMatches} ${totalMatches === 1 ? 'user' : 'users'} found`}
          </p>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">{loading ? 'Loading…' : 'No users found'}</p>
                    </td>
                  </tr>
                ) : (
                  users.map(user => {
                    const photo = photoOf(user)
                    return (
                      <tr
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className="hover:bg-gray-700/50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {photo ? (
                              <img src={photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-semibold text-white">
                                {user.profile?.stageName || <span className="italic text-gray-500">No stage name</span>}
                              </div>
                              <div className="text-xs text-gray-400">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{user.email}</div>
                          <div className="text-xs text-gray-500">{user.profile?.phone || 'No phone'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            {user.profile?.verified ? (
                              <span className="flex items-center text-xs text-green-400">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </span>
                            ) : (
                              <span className="flex items-center text-xs text-yellow-400">
                                <XCircle className="w-3 h-3 mr-1" />
                                Not Verified
                              </span>
                            )}
                            {user.profile?.active !== false ? (
                              <span className="text-xs text-green-400">Active</span>
                            ) : (
                              <span className="text-xs text-red-400">Inactive</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedUser(user) }}
                              className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); sendMessage(user) }}
                              className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                              title="Send Message"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-gray-300 text-sm">Page {currentPage} of {totalPages}</span>
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

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetails
          user={selectedUser}
          photo={photoOf(selectedUser)}
          roleBadge={getRoleBadgeColor(selectedUser.role)}
          onClose={() => setSelectedUser(null)}
          onMessage={() => sendMessage(selectedUser)}
          onViewProfile={() => router.push(`/talent/${selectedUser.username}`)}
        />
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-white text-sm break-words">{value || <span className="text-gray-500">—</span>}</p>
    </div>
  )
}

function UserDetails({
  user, photo, roleBadge, onClose, onMessage, onViewProfile,
}: {
  user: User
  photo: string | null
  roleBadge: string
  onClose: () => void
  onMessage: () => void
  onViewProfile: () => void
}) {
  const p = user.profile
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            {photo ? (
              <img src={photo} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-gray-500" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-white">{p?.stageName || user.username}</h3>
              <p className="text-gray-400 text-sm">@{user.username}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded ${roleBadge}`}>
                {user.role}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white" title="Close">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <h4 className="text-white font-medium mb-3">Contact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                <Detail label="Email (login)" value={user.email} />
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <Detail label="Phone" value={p?.phone} />
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <Detail label="Location" value={[p?.city, p?.state].filter(Boolean).join(', ')} />
              </div>
              <Detail label="Social / Links" value={[
                p?.instagram && `IG: ${p.instagram}`,
                p?.twitter && `X: ${p.twitter}`,
                p?.onlyfans && `OF: ${p.onlyfans}`,
                p?.website,
              ].filter(Boolean).join(' · ')} />
            </div>
          </section>

          {p ? (
            <>
              <section className="border-t border-gray-700 pt-4">
                <h4 className="text-white font-medium mb-3">Profile</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Detail label="Age" value={p.age} />
                  <Detail label="Orientation" value={p.sexualOrientation} />
                  <Detail label="Body Type" value={p.bodyType} />
                  <Detail label="Height" value={p.height} />
                  <Detail label="Weight" value={p.weight} />
                  <Detail label="Ethnicity" value={p.ethnicity} />
                  <Detail label="Hair" value={p.hairColor} />
                  <Detail label="Eyes" value={p.eyeColor} />
                  <Detail label="Availability" value={p.availability} />
                  <Detail label="Will Travel" value={p.willingToTravel ? 'Yes' : 'No'} />
                </div>
                <div className="mt-4">
                  <Detail label="Types of Work" value={p.jobTypes.join(', ')} />
                </div>
                {p.bio && (
                  <div className="mt-4">
                    <p className="text-gray-400 text-xs">Bio</p>
                    <p className="text-gray-200 text-sm whitespace-pre-line">{p.bio}</p>
                  </div>
                )}
              </section>
            </>
          ) : (
            <p className="text-sm text-yellow-400 border-t border-gray-700 pt-4">
              This user hasn&apos;t filled out a profile yet.
            </p>
          )}

          <section className="border-t border-gray-700 pt-4">
            <h4 className="text-white font-medium mb-3">Account</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Detail label="Status" value={`${p?.verified ? 'Verified' : 'Not Verified'} · ${p?.active !== false ? 'Active' : 'Inactive'}`} />
              <Detail label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
              <Detail label="Profile Updated" value={p ? new Date(p.updatedAt).toLocaleDateString() : null} />
              <div className="flex items-start gap-2">
                <Camera className="w-4 h-4 text-gray-400 mt-0.5" />
                <Detail label="Photos" value={String(user._count.media)} />
              </div>
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                <Detail label="Messages" value={`${user._count.sentMessages} sent · ${user._count.receivedMessages} received`} />
              </div>
              <Detail label="User ID" value={<span className="text-xs">{user.id}</span>} />
            </div>
          </section>

          <div className="flex gap-2 pt-2">
            {user.role === 'TALENT' && (
              <button
                onClick={onViewProfile}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                View Public Profile
              </button>
            )}
            <button
              onClick={onMessage}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
