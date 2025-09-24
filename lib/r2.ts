import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
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
  url: string
  thumbnailUrl: string
  filename: string
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
    const extension = mimeType.split('/')[1]
    const filename = `${userId}/${uuidv4()}.${extension}`
    const thumbnailFilename = `${userId}/thumb_${uuidv4()}.${extension}`

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
      ContentType: mimeType,
    })
    await r2Client.send(uploadCommand)

    // Upload thumbnail
    const thumbnailCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: thumbnailFilename,
      Body: thumbnail,
      ContentType: 'image/jpeg',
    })
    await r2Client.send(thumbnailCommand)

    // Construct public URLs
    const baseUrl = process.env.R2_PUBLIC_URL || `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev`
    const url = `${baseUrl}/${filename}`
    const thumbnailUrl = `${baseUrl}/${thumbnailFilename}`

    return {
      url,
      thumbnailUrl,
      filename,
      size: processedImage.length,
      mimeType: 'image/jpeg',
    }
  } catch (error) {
    console.error('Error uploading to R2:', error)
    throw new Error('Failed to upload image')
  }
}

/**
 * Delete image from R2
 */
export async function deleteImage(filename: string): Promise<void> {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filename,
    })
    await r2Client.send(deleteCommand)
  } catch (error) {
    console.error('Error deleting from R2:', error)
    throw new Error('Failed to delete image')
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
