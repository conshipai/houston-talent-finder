// app/api/upload/[mediaId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { deleteImage } from '@/lib/r2'

// DELETE - Delete a media item
export async function DELETE(
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

    // Delete from R2 storage
    try {
      await deleteImage(media.filename)
      if (media.thumbnailUrl) {
        // Extract thumbnail filename from URL
        const thumbnailFilename = media.thumbnailUrl.split('/').pop()
        if (thumbnailFilename) {
          await deleteImage(decodeURIComponent(thumbnailFilename))
        }
      }
    } catch (error) {
      console.error('Error deleting from R2:', error)
    }

    // Delete from database
    await prisma.media.delete({
      where: {
        id: params.mediaId
      }
    })

    return NextResponse.json({
      message: 'Media deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { message: 'Failed to delete media' },
      { status: 500 }
    )
  }
}
