import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getImage } from '@/lib/r2'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = decodeURIComponent(params.filename)
    console.log('Image API: Requesting filename:', filename)
    
    // Get session to check if user is authenticated
    const session = await getServerSession(authOptions)
    
    // For private buckets, we MUST have authentication
    if (!session?.user?.id) {
      console.log('Image API: No authenticated user')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
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
      include: {
        user: true
      }
    })
    
    if (!media) {
      console.log('Image API: Media record not found for filename:', filename)
      
      // If admin, try to fetch directly from R2
      if (session.user.role === 'ADMIN') {
        try {
          const imageBuffer = await getImage(filename)
          return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'image/jpeg',
              'Cache-Control': 'private, max-age=3600',
            },
          })
        } catch (error) {
          console.error('Image API: Failed to fetch for admin:', error)
        }
      }
      
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }
    
    // Check access rights
    let hasAccess = false
    
    if (
      media.userId === session.user.id || // Own images
      session.user.role === 'ADMIN' || // Admins see everything
      (session.user.role === 'PRODUCER' && media.isApproved && media.isPublic) // Producers see approved public
    ) {
      hasAccess = true
      console.log('Image API: Access granted for user:', session.user.id)
    }
    
    if (!hasAccess) {
      console.log('Image API: Access denied for user:', session.user.id)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    try {
      // Determine the actual R2 key to fetch
      let r2Key = media.filename
      
      // If the filename in the request contains 'thumb_', use the thumbnail filename
      if (filename.includes('thumb_') && media.thumbnailUrl) {
        // Extract the thumbnail filename from the thumbnailUrl
        const thumbParts = media.thumbnailUrl.split('/')
        const thumbFilename = thumbParts[thumbParts.length - 1]
        if (thumbFilename) {
          // Construct the full R2 key for the thumbnail
          const userIdPart = media.filename.split('/')[0]
          r2Key = `${userIdPart}/${decodeURIComponent(thumbFilename)}`
        }
      }
      
      console.log('Image API: Fetching from R2 with key:', r2Key)
      
      const imageBuffer = await getImage(r2Key)
      const contentType = media.mimeType || 'image/jpeg'
      
      console.log('Image API: Successfully fetched image, size:', imageBuffer.length, 'bytes')
      
      // Return the image with appropriate headers
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'private, max-age=3600',
          'Content-Disposition': 'inline',
        },
      })
      
    } catch (r2Error) {
      console.error('Image API: R2 Error:', r2Error)
      
      // Try alternative keys if the first attempt fails
      const alternativeKeys = [
        media.filename,
        `${session.user.id}/${filename}`,
        filename,
      ]
      
      for (const altKey of alternativeKeys) {
        try {
          console.log('Image API: Trying alternative key:', altKey)
          const imageBuffer = await getImage(altKey)
          
          return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
              'Content-Type': media.mimeType || 'image/jpeg',
              'Cache-Control': 'private, max-age=3600',
            },
          })
        } catch (altError) {
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
