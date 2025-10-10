// app/api/admin/broadcast/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { subject, content, targetRole, targetUserIds } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    let where: any = {
      id: { not: session?.user?.id } // Don't send to self
    }

    // Filter by role if specified
    if (targetRole && ['TALENT', 'PRODUCER'].includes(targetRole)) {
      where.role = targetRole
    }

    // Or send to specific users
    if (targetUserIds && Array.isArray(targetUserIds) && targetUserIds.length > 0) {
      where = {
        id: { in: targetUserIds }
      }
    }

    // Get target users
    const users = await prisma.user.findMany({
      where,
      select: { id: true }
    })

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found' },
        { status: 400 }
      )
    }

    // Create messages for all recipients
    const messages = await prisma.message.createMany({
      data: users.map(user => ({
        senderId: session?.user?.id!,
        receiverId: user.id,
        subject: subject || 'System Message',
        content
      }))
    })

    return NextResponse.json({
      success: true,
      messagesSent: messages.count
    })
    
  } catch (error) {
    console.error('Broadcast error:', error)
    return NextResponse.json(
      { error: 'Failed to send broadcast' },
      { status: 500 }
    )
  }
}
