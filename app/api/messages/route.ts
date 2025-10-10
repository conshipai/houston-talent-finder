// app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Get messages for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'inbox'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    let where = {}
    
    if (type === 'inbox') {
      where = {
        receiverId: session.user.id,
        isArchived: false
      }
    } else if (type === 'sent') {
      where = {
        senderId: session.user.id
      }
    } else if (type === 'archived') {
      where = {
        receiverId: session.user.id,
        isArchived: true
      }
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true
            }
          },
          receiver: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.message.count({ where })
    ])

    // Get unread count
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: session.user.id,
        isRead: false,
        isArchived: false
      }
    })

    return NextResponse.json({
      messages,
      total,
      page,
      pages: Math.ceil(total / limit),
      unreadCount
    })
    
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { message: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// Send a message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { receiverId, receiverUsername, subject, content } = body

    if (!content) {
      return NextResponse.json(
        { message: 'Message content is required' },
        { status: 400 }
      )
    }

    if (!receiverId && !receiverUsername) {
      return NextResponse.json(
        { message: 'Receiver ID or username is required' },
        { status: 400 }
      )
    }

    // Find receiver by ID or username
    const receiver = await prisma.user.findUnique({
      where: receiverId 
        ? { id: receiverId }
        : { username: receiverUsername.toLowerCase() }
    })

    if (!receiver) {
      return NextResponse.json(
        { message: 'Receiver not found' },
        { status: 404 }
      )
    }

    // Don't allow sending messages to yourself
    if (receiver.id === session.user.id) {
      return NextResponse.json(
        { message: 'Cannot send messages to yourself' },
        { status: 400 }
      )
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: receiver.id,
        subject: subject || null,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Message sent successfully',
      data: message
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { message: 'Failed to send message' },
      { status: 500 }
    )
  }
}
