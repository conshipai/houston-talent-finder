import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSignedImageUrl, getImage } from '@/lib/r2'
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
    
        // Try to find the media record
   const media = await prisma.media.findFirst({
  where: {
    OR: [
      { filename },
      { filename: { contains: filename } },
      { thumbnailUrl: { contains: filename } },  // ✅ Use thumbnailUrl like in GET method
    ],
  },
})
        
    // Determine access rights
    let hasAccess = false
    
    if (!media) {
      // If no media record but user is admin, allow access
      if (session.user.role === 'ADMIN') {
        console.log('Image API: Admin access granted (no media record)')
        hasAccess = true
      } else {
        console.log('Image API: Media not found for filename:', filename)
        return NextResponse.json(
          { error: 'Image not found' },
          { status: 404 }
        )
      }
    } else {
      // Check access based on role and ownership
      if (
        media.userId === session.user.id || // Own images
        session.user.role === 'ADMIN' || // Admins see everything
        (session.user.role === 'PRODUCER' && media.isApproved && media.isPublic) // Producers see approved public
      ) {
        hasAccess = true
        console.log('Image API: Access granted for user:', session.user.id)
      }
    }
    
    if (!hasAccess) {
      console.log('Image API: Access denied for user:', session.user.id)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    try {
      // For private buckets, we need to proxy the image through our server
      console.log('Image API: Fetching image from R2:', filename)
      
      const imageBuffer = await getImage(filename)
      const contentType = media?.mimeType || 'image/jpeg'
      
      console.log('Image API: Serving image, size:', imageBuffer.length, 'bytes')
      
      // Convert Buffer to Uint8Array for NextResponse
      const uint8Array = new Uint8Array(imageBuffer);
      
      // Return the image with appropriate headers
      return new NextResponse(uint8Array, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
          'Content-Disposition': 'inline',
          'Content-Length': imageBuffer.length.toString(),
        },
      })
      
    } catch (r2Error) {
      console.error('Image API: R2 Error:', r2Error)
      
      // If direct fetch fails, try with signed URL as fallback
      try {
        console.log('Image API: Attempting signed URL fallback')
        const signedUrl = await getSignedImageUrl(filename, 3600)
        console.log('Image API: Redirecting to signed URL')
        
        // Return redirect response
        return NextResponse.redirect(signedUrl, {
          status: 302,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        })
      } catch (signedError) {
        console.error('Image API: Signed URL Error:', signedError)
        return NextResponse.json(
          { error: 'Failed to retrieve image', details: (signedError as Error).message },
          { status: 500 }
        )
      }
    }
    
  } catch (error) {
    console.error('Image API Error:', error)
    return NextResponse.json(
      { error: 'Failed to serve image', details: (error as Error).message },
      { status: 500 }
    )
  }
}

// Optional: Add HEAD method for checking if image exists
export async function HEAD(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = decodeURIComponent(params.filename)
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 })
    }
    
    const media = await prisma.media.findFirst({
      where: {
        OR: [
          { filename },
          { filename: { contains: filename } },
          { thumbnailUrl: { contains: filename } },
        ],
      },
    })
    
    if (!media) {
      return new NextResponse(null, { status: 404 })
    }
    
    // Check access
    if (
      media.userId !== session.user.id &&
      session.user.role !== 'ADMIN' &&
      !(session.user.role === 'PRODUCER' && media.isApproved && media.isPublic)
    ) {
      return new NextResponse(null, { status: 403 })
    }
    
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'Content-Type': media.mimeType || 'image/jpeg',
      }
    })
  } catch (error) {
    console.error('Image HEAD Error:', error)
    return new NextResponse(null, { status: 500 })
  }
}
