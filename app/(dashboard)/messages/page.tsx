'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch(`/api/messages/${messageId}`, { method: 'DELETE' })
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composeData)
      })
      if (response.ok) {
        setShowCompose(false)
        setComposeData({ receiverUsername: '', subject: '', content: '' })
        if (activeTab === 'sent') loadMessages()
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
              <Link 
                href="/dashboard" 
                className="text-red-400 hover:text-red-500 flex items-center space-x-1 mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
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

      {/* rest of your message UI unchanged */}
      {/* ... existing code continues here ... */}
    </div>
  )
}
