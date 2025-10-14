'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, Search, Filter, Mail, Ban, Trash2, 
  Shield, Eye, ChevronLeft, ChevronRight, Camera,
  CheckCircle, XCircle, Calendar, MessageSquare
} from 'lucide-react'

interface User {
  id: string
  username: string
  email: string
  role: 'TALENT' | 'PRODUCER' | 'ADMIN'
  createdAt: string
  profile: {
    verified: boolean
    active: boolean
  } | null
  _count: {
    media: number
    sentMessages: number
    receivedMessages: number
  }
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    checkAdminAndLoadUsers()
  }, [currentPage, selectedRole])

  const checkAdminAndLoadUsers = async () => {
    try {
      // Check if user is admin
      const res = await fetch('/api/admin/verify')
      if (!res.ok) {
        router.push('/dashboard')
        return
      }

      await loadUsers()
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })

      if (selectedRole && selectedRole !== 'all') {
        params.append('role', selectedRole)
      }

      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        setTotalPages(data.pages || 1)
        setTotalUsers(data.total || 0)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.id.toLowerCase().includes(term)
    )
  })

  const viewUserProfile = (user: User) => {
    if (user.role === 'TALENT') {
      router.push(`/talent/${user.username}`)
    } else {
      setSelectedUser(user)
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

  if (loading && users.length === 0) {
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white">{totalUsers}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-600">
            <p className="text-gray-400 text-sm">Talent</p>
            <p className="text-2xl font-bold text-purple-500">
              {users.filter(u => u.role === 'TALENT').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-blue-600">
            <p className="text-gray-400 text-sm">Producers</p>
            <p className="text-2xl font-bold text-blue-500">
              {users.filter(u => u.role === 'PRODUCER').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-red-600">
            <p className="text-gray-400 text-sm">Admins</p>
            <p className="text-2xl font-bold text-red-500">
              {users.filter(u => u.role === 'ADMIN').length}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by username, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              />
            </div>

            {/* Role Filter */}
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
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Stats
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-400">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
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
                        <div className="text-sm text-gray-400 space-y-1">
                          <div className="flex items-center">
                            <Camera className="w-3 h-3 mr-1" />
                            {user._count.media} photos
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {user._count.sentMessages + user._count.receivedMessages} messages
                          </div>
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
                            onClick={() => viewUserProfile(user)}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => sendMessage(user)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                            title="Send Message"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex space-x-1">
              {[...Array(Math.min(totalPages, 10))].map((_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
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

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedUser.username}</h3>
                <p className="text-gray-400 text-sm">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Role</p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getRoleBadgeColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">User ID</p>
                  <p className="text-white text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Joined</p>
                  <p className="text-white text-sm">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="text-white text-sm">
                    {selectedUser.profile?.verified ? 'Verified' : 'Not Verified'} • 
                    {selectedUser.profile?.active !== false ? ' Active' : ' Inactive'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-white font-medium mb-2">Activity Stats</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-700 rounded p-3">
                    <p className="text-gray-400 text-xs">Photos</p>
                    <p className="text-white text-xl font-bold">{selectedUser._count.media}</p>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <p className="text-gray-400 text-xs">Sent</p>
                    <p className="text-white text-xl font-bold">{selectedUser._count.sentMessages}</p>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <p className="text-gray-400 text-xs">Received</p>
                    <p className="text-white text-xl font-bold">{selectedUser._count.receivedMessages}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                {selectedUser.role === 'TALENT' && (
                  <button
                    onClick={() => router.push(`/talent/${selectedUser.username}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                  >
                    View Profile
                  </button>
                )}
                <button
                  onClick={() => {
                    sendMessage(selectedUser)
                    setSelectedUser(null)
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
