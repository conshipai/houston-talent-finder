import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadImage, validateImage } from '@/lib/r2'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string || ''
    const description = formData.get('description') as string || ''
    const isProfilePhoto = formData.get('isProfilePhoto') === 'true'
    const isPublic = formData.get('isPublic') !== 'false' // Default true

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateImage(file)
    if (!validation.valid) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to R2
    const uploadResult = await uploadImage(
      buffer,
      file.type,
      session.user.id
    )
    
    // For private buckets, we need to use the API endpoint to serve images
    // Store just the filename in the database, not full URLs
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    // Create URLs that will go through our API endpoint
    const imageUrl = `${baseUrl}/api/images/${encodeURIComponent(uploadResult.filename)}`
    const thumbnailUrl = uploadResult.thumbnailFilename 
      ? `${baseUrl}/api/images/${encodeURIComponent(uploadResult.thumbnailFilename)}`
      : null
    
    console.log('Generated URLs:', { imageUrl, thumbnailUrl }) // Debug log

    // If this is a profile photo, unset any existing profile photos
    if (isProfilePhoto) {
      await prisma.media.updateMany({
        where: {
          userId: session.user.id,
          isProfilePhoto: true,
        },
        data: {
          isProfilePhoto: false,
        }
      })
    }

    // Save media record to database
    const media = await prisma.media.create({
      data: {
        userId: session.user.id,
        filename: uploadResult.filename,  // Store the R2 key
        url: imageUrl,                    // Store the API endpoint URL
        thumbnailUrl: thumbnailUrl,        // Store the API endpoint URL for thumbnail
        type: 'PHOTO',
        size: uploadResult.size,
        mimeType: uploadResult.mimeType,
        title,
        description,
        isProfilePhoto,
        isPublic,
        isApproved: false, // Requires admin approval
      }
    })

    return NextResponse.json({
      message: 'Upload successful',
      media: {
        id: media.id,
        url: media.url,
        thumbnailUrl: media.thumbnailUrl,
        title: media.title,
        isProfilePhoto: media.isProfilePhoto,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { message: 'Upload failed', error: error },
      { status: 500 }
    )
  }
}

// Get user's media
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const media = await prisma.media.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      }
    })

    // The URLs in the database should already point to our API endpoint
    return NextResponse.json({ media })

  } catch (error) {
    console.error('Fetch media error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}
