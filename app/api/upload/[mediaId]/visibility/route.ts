// app/api/upload/[mediaId]/visibility/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PATCH - Toggle media visibility (public/private)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { mediaId: string } }
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
    const { isPublic } = body

    // Check if media belongs to user
    const media = await prisma.media.findFirst({
      where: {
        id: params.mediaId,
        userId: session.user.id
      }
    })

    if (!media) {
      return NextResponse.json(
        { message: 'Media not found' },
        { status: 404 }
      )
    }

    // Update visibility
    const updatedMedia = await prisma.media.update({
      where: {
        id: params.mediaId
      },
      data: {
        isPublic: isPublic
      }
    })

    return NextResponse.json({
      message: 'Visibility updated successfully',
      media: updatedMedia
    })

  } catch (error) {
    console.error('Error updating visibility:', error)
    return NextResponse.json(
      { message: 'Failed to update visibility' },
      { status: 500 }
    )
  }
}
