// app/api/upload/[mediaId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { deleteImage } from '@/lib/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteParams = { params: { mediaId: string } }

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    // Ensure media belongs to the current user
    const media = await prisma.media.findFirst({
      where: {
        id: params.mediaId,
        userId: session.user.id,
      },
    })

    if (!media) {
      return NextResponse.json({ message: 'Media not found' }, { status: 404 })
    }

    // Delete from R2 storage
    try {
      await deleteImage(media.filename)

      if (media.thumbnailUrl) {
        // Extract final segment and compute the key in the same folder as the original
        const thumbnailFilename = media.thumbnailUrl.split('/').pop()
        if (thumbnailFilename) {
          const decodedFilename = decodeURIComponent(thumbnailFilename)
          const lastSlashIndex = media.filename.lastIndexOf('/')
          const basePath =
            lastSlashIndex === -1 ? '' : media.filename.slice(0, lastSlashIndex + 1)
          const thumbnailKey = basePath ? `${basePath}${decodedFilename}` : decodedFilename
          await deleteImage(thumbnailKey)
        }
      }
    } catch (err) {
      console.error('Error deleting from R2:', err)
      // continue to DB delete to avoid orphaned rows
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: params.mediaId },
    })

    return NextResponse.json({ message: 'Media deleted successfully' })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json({ message: 'Failed to delete media' }, { status: 500 })
  }
}
