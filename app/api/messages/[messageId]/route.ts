// app/api/messages/[messageId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Mark message as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    // Check if message belongs to user
    const message = await prisma.message.findFirst({
      where: {
        id: params.messageId,
        OR: [
          { receiverId: session.user.id },
          { senderId: session.user.id }
        ]
      }
    })

    if (!message) {
      return NextResponse.json(
        { message: 'Message not found' },
        { status: 404 }
      )
    }

    let updateData = {}

    switch (action) {
      case 'read':
        if (message.receiverId !== session.user.id) {
          return NextResponse.json(
            { message: 'Cannot mark this message as read' },
            { status: 403 }
          )
        }
        updateData = { isRead: true }
        break
      
      case 'unread':
        if (message.receiverId !== session.user.id) {
          return NextResponse.json(
            { message: 'Cannot mark this message as unread' },
            { status: 403 }
          )
        }
        updateData = { isRead: false }
        break
      
      case 'archive':
        if (message.receiverId !== session.user.id) {
          return NextResponse.json(
            { message: 'Cannot archive this message' },
            { status: 403 }
          )
        }
        updateData = { isArchived: true }
        break
      
      case 'unarchive':
        if (message.receiverId !== session.user.id) {
          return NextResponse.json(
            { message: 'Cannot unarchive this message' },
            { status: 403 }
          )
        }
        updateData = { isArchived: false }
        break
      
      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedMessage = await prisma.message.update({
      where: { id: params.messageId },
      data: updateData
    })

    return NextResponse.json({
      message: 'Message updated successfully',
      data: updatedMessage
    })
    
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { message: 'Failed to update message' },
      { status: 500 }
    )
  }
}

// Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if message belongs to user
    const message = await prisma.message.findFirst({
      where: {
        id: params.messageId,
        OR: [
          { receiverId: session.user.id },
          { senderId: session.user.id }
        ]
      }
    })

    if (!message) {
      return NextResponse.json(
        { message: 'Message not found' },
        { status: 404 }
      )
    }

    await prisma.message.delete({
      where: { id: params.messageId }
    })

    return NextResponse.json({
      message: 'Message deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { message: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
