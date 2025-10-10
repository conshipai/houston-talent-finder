'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Mail, Send, Archive, Trash2, Eye, EyeOff, 
  ChevronLeft, ChevronRight, Inbox, Clock, X 
} from 'lucide-react'

interface Message {
  id: string
  subject: string | null
  content: string
  isRead: boolean
  isArchived: boolean
  createdAt: string
  sender: {
    id: string
    username: string
    email: string
    role: string
  }
  receiver: {
    id: string
    username: string
    email: string
  }
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'archived'>('inbox')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showCompose, setShowCompose] = useState(false)
  const [composeData, setComposeData] = useState({
    receiverUsername: '',
    subject: '',
    content: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      loadMessages()
    }
  }, [status, activeTab, page])

  const loadMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/messages?type=${activeTab}&page=${page}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
        setTotalPages(data.pages)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'read' })
      })
      
      if (response.ok) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, isRead: true } : msg
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const archiveMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'archive' })
      })
      
      if (response.ok) {
        loadMessages()
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error('Error archiving message:', error)
    }
  }

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        loadMessages()
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const sendMessage = async () => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(composeData)
      })
      
      if (response.ok) {
        setShowCompose(false)
        setComposeData({ receiverUsername: '', subject: '', content: '' })
        if (activeTab === 'sent') {
          loadMessages()
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const openMessage = (message: Message) => {
    setSelectedMessage(message)
    if (!message.isRead && message.receiver.id === session?.user?.id) {
      markAsRead(message.id)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
              <h1 className="text-2xl font-bold text-white">Messages</h1>
              {unreadCount > 0 && (
                <p className="text-gray-400 mt-1">
                  You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowCompose(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Compose</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => {
              setActiveTab('inbox')
              setPage(1)
            }}
            className={`pb-3 px-1 flex items-center space-x-2 ${
              activeTab === 'inbox' 
                ? 'text-red-500 border-b-2 border-red-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Inbox</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('sent')
              setPage(1)
            }}
            className={`pb-3 px-1 flex items-center space-x-2 ${
              activeTab === 'sent' 
                ? 'text-red-500 border-b-2 border-red-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Sent</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('archived')
              setPage(1)
            }}
            className={`pb-3 px-1 flex items-center space-x-2 ${
              activeTab === 'archived' 
                ? 'text-red-500 border-b-2 border-red-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Archived</span>
          </button>
        </div>

        {/* Messages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1 space-y-2">
            {loading ? (
              <div className="text-gray-400 text-center py-8">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No messages in {activeTab}</p>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  onClick={() => openMessage(message)}
                  className={`bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition ${
                    !message.isRead && message.receiver.id === session?.user?.id
                      ? 'border-l-4 border-red-500' 
                      : ''
                  } ${selectedMessage?.id === message.id ? 'ring-2 ring-red-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-white">
                        {activeTab === 'sent' 
                          ? `To: ${message.receiver.username}`
                          : message.sender.username
                        }
                        {message.sender.role === 'ADMIN' && (
                          <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded">Admin</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-400">
                        {message.subject || '(No subject)'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!message.isRead && message.receiver.id === session?.user?.id && (
                        <Eye className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {message.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 pt-4">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="p-2 bg-gray-700 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <span className="text-white">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-gray-700 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="border-b border-gray-700 pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {selectedMessage.subject || '(No subject)'}
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">
                        From: {selectedMessage.sender.username} ({selectedMessage.sender.email})
                        {selectedMessage.sender.role === 'ADMIN' && (
                          <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded">Admin</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-400">
                        To: {selectedMessage.receiver.username}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {selectedMessage.receiver.id === session?.user?.id && !selectedMessage.isArchived && (
                        <button
                          onClick={() => archiveMessage(selectedMessage.id)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4 text-white" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-gray-300 whitespace-pre-wrap">
                  {selectedMessage.content}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Compose Message</h3>
              <button
                onClick={() => setShowCompose(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient Username
                </label>
                <input
                  type="text"
                  value={composeData.receiverUsername}
                  onChange={(e) => setComposeData({...composeData, receiverUsername: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Enter subject"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={composeData.content}
                  onChange={(e) => setComposeData({...composeData, content: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white h-32"
                  placeholder="Type your message..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!composeData.receiverUsername || !composeData.content}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg"
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
