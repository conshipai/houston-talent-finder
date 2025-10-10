// app/api/upload/[mediaId]/profile-photo/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST - Set media as profile photo
export async function POST(
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

    // Unset any existing profile photo
    await prisma.media.updateMany({
      where: {
        userId: session.user.id,
        isProfilePhoto: true
      },
      data: {
        isProfilePhoto: false
      }
    })

    // Set new profile photo
    await prisma.media.update({
      where: {
        id: params.mediaId
      },
      data: {
        isProfilePhoto: true
      }
    })

    return NextResponse.json({
      message: 'Profile photo updated successfully'
    })

  } catch (error) {
    console.error('Error setting profile photo:', error)
    return NextResponse.json(
      { message: 'Failed to set profile photo' },
      { status: 500 }
    )
  }
}
