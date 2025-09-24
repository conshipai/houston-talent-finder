import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSignedImageUrl, getImage } from '@/lib/r2'
import { prisma } from '@/lib/db'

// Serve images through signed URLs (recommended for performance)
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = decodeURIComponent(params.filename)
    
    // Method 1: Public images (no auth required for approved public images)
    // Check if this is a public, approved image
    const media = await prisma.media.findFirst({
      where: {
        OR: [
          { filename },
          { thumbnailUrl: { contains: filename } },
        ],
      },
      include: {
        user: true,
      }
    })

    // Get session to check if user is authenticated
    const session = await getServerSession(authOptions)
    
    // Access control logic
    let hasAccess = false
    
    if (!media) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }
    
    // Determine access rights
    if (media.isPublic && media.isApproved) {
      // Public and approved images are accessible to everyone
      hasAccess = true
    } else if (session?.user) {
      // Logged-in users can see:
      // 1. Their own images
      // 2. Other images based on role
      if (
        media.userId === session.user.id || // Own images
        session.user.role === 'ADMIN' || // Admins see everything
        session.user.role === 'PRODUCER' // Producers see approved talent images
      ) {
        hasAccess = true
      }
    }
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Method 1: Redirect to signed URL (recommended)
    // This is more efficient as it lets Cloudflare handle the image serving
    const signedUrl = await getSignedImageUrl(filename, 3600) // 1 hour expiry
    return NextResponse.redirect(signedUrl)
    
    // Method 2: Proxy through your server (alternative, uses more bandwidth)
    // Uncomment if you prefer to hide R2 completely
    /*
    const imageBuffer = await getImage(filename)
    const contentType = media.mimeType || 'image/jpeg'
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
    */
    
  } catch (error) {
    console.error('Error serving image:', error)
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    )
  }
}
