import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import sharp from "sharp"
import { v4 as uuidv4 } from "uuid"

// Initialize R2 client
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export interface UploadResult {
  filename: string
  thumbnailFilename: string
  size: number
  mimeType: string
}

/**
 * Upload image to R2 with automatic thumbnail generation
 */
export async function uploadImage(
  file: Buffer,
  mimeType: string,
  userId: string
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const extension = mimeType.split('/')[1] || 'jpg'
    const uniqueId = uuidv4()
    const filename = `${userId}/${uniqueId}.${extension}`
    const thumbnailFilename = `${userId}/thumb_${uniqueId}.${extension}`
    
    console.log('R2: Uploading files:', { filename, thumbnailFilename })

    // Process main image (optimize but maintain quality)
    const processedImage = await sharp(file)
      .resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90 })
      .toBuffer()

    // Create thumbnail
    const thumbnail = await sharp(file)
      .resize(400, 400, {
        fit: 'cover',
        position: 'centre',
      })
      .jpeg({ quality: 80 })
      .toBuffer()

    // Upload main image
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filename,
      Body: processedImage,
      ContentType: 'image/jpeg', // Always JPEG after processing
    })
    
    await r2Client.send(uploadCommand)
    console.log('R2: Main image uploaded successfully')

    // Upload thumbnail
    const thumbnailCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: thumbnailFilename,
      Body: thumbnail,
      ContentType: 'image/jpeg',
    })
    
    await r2Client.send(thumbnailCommand)
    console.log('R2: Thumbnail uploaded successfully')

    return {
      filename,
      thumbnailFilename,
      size: processedImage.length,
      mimeType: 'image/jpeg',
    }
  } catch (error) {
    console.error('R2 Upload Error:', error)
    throw new Error('Failed to upload image to R2')
  }
}

/**
 * Get image as buffer (for serving through API)
 * This is the main method for private buckets
 */
export async function getImage(filename: string): Promise<Buffer> {
  try {
    console.log('R2: Fetching image:', filename)
    
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filename,
    })

    const response = await r2Client.send(command)
    
    if (!response.Body) {
      throw new Error('No image data received from R2')
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    
    // @ts-ignore - Body is a readable stream
    for await (const chunk of response.Body) {
      chunks.push(chunk)
    }
    
    const buffer = Buffer.concat(chunks)
    console.log('R2: Image fetched, size:', buffer.length)
    
    return buffer
  } catch (error) {
    console.error('R2 Get Image Error:', error)
    throw new Error(`Failed to fetch image from R2: ${error}`)
  }
}

/**
 * Generate a presigned URL for secure image access
 * This is a fallback method for private buckets
 */
export async function getSignedImageUrl(
  filename: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  try {
    console.log('R2: Generating signed URL for:', filename)
    
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filename,
    })

    const url = await getSignedUrl(r2Client, command, { expiresIn })
    console.log('R2: Signed URL generated')
    
    return url
  } catch (error) {
    console.error('R2 Signed URL Error:', error)
    throw new Error('Failed to generate signed URL')
  }
}

/**
 * Delete image from R2
 */
export async function deleteImage(filename: string): Promise<void> {
  try {
    console.log('R2: Deleting image:', filename)
    
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filename,
    })
    
    await r2Client.send(deleteCommand)
    console.log('R2: Image deleted successfully')
  } catch (error) {
    console.error('R2 Delete Error:', error)
    throw new Error('Failed to delete image from R2')
  }
}

/**
 * Generate a presigned URL for direct uploads (optional - for large files)
 */
export async function getPresignedUploadUrl(
  filename: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: filename,
    ContentType: contentType,
  })

  return await getSignedUrl(r2Client, command, { expiresIn: 3600 })
}

/**
 * Validate image file
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File must be JPEG, PNG, or WebP' }
  }

  return { valid: true }
}
