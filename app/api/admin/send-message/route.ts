// app/api/admin/send-message/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const session = await getServerSession(authOptions)
  const body = await request.json()
  const { userIds, subject, content } = body

  if (!content) {
    return NextResponse.json(
      { error: 'Message content is required' },
      { status: 400 }
    )
  }

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json(
      { error: 'At least one recipient is required' },
      { status: 400 }
    )
  }

  try {
    // Create messages for each selected user
    const messages = await prisma.message.createMany({
      data: userIds.map((userId: string) => ({
        senderId: session!.user.id,
        receiverId: userId,
        subject: subject || 'Message from Admin',
        content,
      }))
    })

    return NextResponse.json({ 
      success: true, 
      count: messages.count 
    })
  } catch (error) {
    console.error('Error sending messages:', error)
    return NextResponse.json(
      { error: 'Failed to send messages' },
      { status: 500 }
    )
  }
}
