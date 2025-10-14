// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadImage, validateImage } from '@/lib/r2'
import { buildImageRequestPath } from '@/lib/media'

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

    // Upload to R2 with user role
    const uploadResult = await uploadImage(
      buffer,
      file.type,
      session.user.id,
      session.user.role // Pass the user's role
    )
    
    // For private buckets, we need to use the API endpoint to serve images
    // Store the full R2 key in the database
       // Create URLs that will go through our API endpoint (relative so they work on any origin)
    const imageUrl = buildImageRequestPath(uploadResult.filename)
    if (!imageUrl) {
      throw new Error('Failed to generate image URL')
    }

    const thumbnailUrl = buildImageRequestPath(uploadResult.thumbnailFilename)

    console.log('Upload: Generated URLs:', { imageUrl, thumbnailUrl })
    console.log('Upload: Stored filenames:', { 
      filename: uploadResult.filename, 
      thumbnailFilename: uploadResult.thumbnailFilename 
    })

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

    // Save media record to database with full R2 key
    const media = await prisma.media.create({
      data: {
        userId: session.user.id,
        filename: uploadResult.filename,  // Store the full R2 key (includes talent/ prefix if applicable)
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
      { message: 'Upload failed', error: (error as Error).message },
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

  const normalizedMedia = media.map(item => {
      const normalizedUrl =
        buildImageRequestPath(item.url) ??
        buildImageRequestPath(item.filename) ??
        item.url

      const normalizedThumbnail =
        buildImageRequestPath(item.thumbnailUrl) ?? item.thumbnailUrl

      return {
        ...item,
        url: normalizedUrl,
        thumbnailUrl: normalizedThumbnail,
      }
    })

    return NextResponse.json({ media: normalizedMedia })

  } catch (error) {
    console.error('Fetch media error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}
