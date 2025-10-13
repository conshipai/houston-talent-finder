// app/api/images/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getImage } from '@/lib/r2'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteParams = { params: { filename: string } }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const filename = decodeURIComponent(params.filename)
    console.log('Image API: Requesting filename:', filename)

    // Get session if present (public+approved can be served without a session)
    const session = await getServerSession(authOptions)

    // Try to find the media record by filename
    const media = await prisma.media.findFirst({
      where: {
        OR: [
          { filename },
          { filename: { endsWith: filename } },
          { url: { contains: filename } },
          { thumbnailUrl: { contains: filename } },
        ],
      },
      include: { user: true },
    })

    if (!media) {
      console.log('Image API: Media record not found for filename:', filename)

      // If admin, try to fetch directly from R2
      if (session?.user?.role === 'ADMIN') {
        try {
          const imageBuffer = await getImage(filename)
          const uint8Array = new Uint8Array(imageBuffer)
          return new NextResponse(uint8Array, {
            status: 200,
            headers: {
              'Content-Type': 'image/jpeg',
              'Cache-Control': 'private, max-age=3600',
              'Content-Disposition': 'inline',
            },
          })
        } catch (error) {
          console.error('Image API: Failed to fetch for admin:', error)
        }
      }

      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Access control
    const sessionUser = session?.user
    const isPublicMedia = !!(media.isApproved && media.isPublic)
    const hasSessionAccess =
      !!sessionUser &&
      (media.userId === sessionUser.id ||
        sessionUser.role === 'ADMIN' ||
        (sessionUser.role === 'PRODUCER' && isPublicMedia))

    const hasAccess = isPublicMedia || hasSessionAccess

    if (!hasAccess) {
      const status = sessionUser ? 403 : 401
      console.log('Image API: Access denied for user:', sessionUser?.id ?? 'anonymous')
      return NextResponse.json(
        { error: status === 401 ? 'Authentication required' : 'Unauthorized' },
        { status }
      )
    }

    // Build the R2 key to fetch
    const originalKey = media.filename
    const lastSlashIndex = originalKey.lastIndexOf('/')
    const basePath = lastSlashIndex === -1 ? '' : originalKey.slice(0, lastSlashIndex + 1)

    let r2Key = originalKey
    if (filename.includes('/')) {
      // Full key provided in request
      r2Key = filename
    } else if (filename.startsWith('thumb_')) {
      r2Key = `${basePath}${filename}`.replace(/^\//, '')
    } else if (!originalKey.endsWith(filename)) {
      r2Key = basePath ? `${basePath}${filename}` : filename
    }

    try {
      console.log('Image API: Fetching from R2 with key:', r2Key)
      const imageBuffer = await getImage(r2Key)
      const contentType = media.mimeType || 'image/jpeg'

      const cacheHeader = isPublicMedia
        ? 'public, max-age=3600, stale-while-revalidate=86400'
        : 'private, max-age=3600'

      console.log('Image API: Successfully fetched image, size:', imageBuffer.length, 'bytes')

      const uint8Array = new Uint8Array(imageBuffer)
      return new NextResponse(uint8Array, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': cacheHeader,
          'Content-Disposition': 'inline',
        },
      })
    } catch (r2Error) {
      console.error('Image API: R2 Error:', r2Error)

      // Try alternative keys if the first attempt fails
      const alternativeKeys = new Set<string>()
      alternativeKeys.add(media.filename)
      alternativeKeys.add(filename)

      if (basePath) {
        alternativeKeys.add(`${basePath}${filename}`)
      }

      if (sessionUser?.id) {
        alternativeKeys.add(`${sessionUser.id}/${filename}`)
      }

      for (const altKey of alternativeKeys) {
        if (!altKey) continue
        try {
          console.log('Image API: Trying alternative key:', altKey)
          const imageBuffer = await getImage(altKey)
          const uint8Array = new Uint8Array(imageBuffer)

          return new NextResponse(uint8Array, {
            status: 200,
            headers: {
              'Content-Type': media.mimeType || 'image/jpeg',
              'Cache-Control': isPublicMedia
                ? 'public, max-age=3600, stale-while-revalidate=86400'
                : 'private, max-age=3600',
              'Content-Disposition': 'inline',
            },
          })
        } catch (_altError) {
          console.log('Image API: Alternative key failed:', altKey)
          continue
        }
      }

      return NextResponse.json(
        { error: 'Failed to retrieve image', details: (r2Error as Error).message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Image API Error:', error)
    return NextResponse.json(
      { error: 'Failed to serve image', details: (error as Error).message },
      { status: 500 }
    )
  }
}
