// scripts/debug-images.js
const { PrismaClient } = require('@prisma/client')
const { S3Client, ListObjectsV2Command, HeadObjectCommand } = require("@aws-sdk/client-s3")

const prisma = new PrismaClient()

// Initialize R2 client
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

async function checkR2Object(key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    })
    await r2Client.send(command)
    return true
  } catch (error) {
    return false
  }
}

async function listR2Objects(prefix) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: 100
    })
    const response = await r2Client.send(command)
    return response.Contents || []
  } catch (error) {
    console.error('Error listing R2 objects:', error)
    return []
  }
}

async function debugImages() {
  try {
    console.log('🔍 Starting image debug...\n')
    
    // Get all users with media
    const users = await prisma.user.findMany({
      where: {
        media: {
          some: {}
        }
      },
      include: {
        media: true
      }
    })
    
    console.log(`Found ${users.length} users with media\n`)
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.username} (${user.id})`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Media count: ${user.media.length}`)
      
      // List all objects in R2 for this user
      const r2Objects = await listR2Objects(user.id)
      console.log(`   R2 objects found: ${r2Objects.length}`)
      
      if (r2Objects.length > 0) {
        console.log('   R2 files:')
        r2Objects.forEach(obj => {
          console.log(`     - ${obj.Key} (${Math.round(obj.Size / 1024)}KB)`)
        })
      }
      
      // Check each media record
      console.log('\n   Media records:')
      for (const media of user.media) {
        console.log(`\n   📷 Media ID: ${media.id}`)
        console.log(`      Filename: ${media.filename}`)
        console.log(`      URL: ${media.url}`)
        console.log(`      Thumbnail: ${media.thumbnailUrl || 'None'}`)
        console.log(`      Approved: ${media.isApproved}`)
        console.log(`      Public: ${media.isPublic}`)
        console.log(`      Profile Photo: ${media.isProfilePhoto}`)
        
        // Check if file exists in R2
        const exists = await checkR2Object(media.filename)
        console.log(`      ✓ Exists in R2: ${exists ? '✅ YES' : '❌ NO'}`)
        
        if (!exists) {
          // Try alternative paths
          const alternatives = [
            `${user.id}/${media.filename}`,
            media.filename.split('/').pop(),
            `${user.id}/${media.filename.split('/').pop()}`
          ]
          
          console.log('      Trying alternative paths:')
          for (const alt of alternatives) {
            const altExists = await checkR2Object(alt)
            if (altExists) {
              console.log(`        ✅ Found at: ${alt}`)
              
              // Fix the database record
              const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
              await prisma.media.update({
                where: { id: media.id },
                data: {
                  filename: alt,
                  url: `${baseUrl}/api/images/${encodeURIComponent(alt.split('/').pop())}`,
                }
              })
              console.log('        📝 Updated database record')
              break
            }
          }
        }
        
        // Check URL format
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const expectedUrlPrefix = `${baseUrl}/api/images/`
        
        if (!media.url.startsWith(expectedUrlPrefix)) {
          console.log(`      ⚠️  URL format incorrect. Should start with: ${expectedUrlPrefix}`)
          
          // Fix the URL
          const filename = media.filename.split('/').pop()
          const correctUrl = `${baseUrl}/api/images/${encodeURIComponent(filename)}`
          
          await prisma.media.update({
            where: { id: media.id },
            data: { url: correctUrl }
          })
          console.log(`      📝 Fixed URL to: ${correctUrl}`)
        }
        
        // Check thumbnail
        if (media.thumbnailUrl) {
          const thumbFilename = media.thumbnailUrl.split('/').pop()
          const thumbKey = `${user.id}/thumb_${media.filename.split('/').pop()}`
          const thumbExists = await checkR2Object(thumbKey)
          console.log(`      ✓ Thumbnail exists in R2: ${thumbExists ? '✅ YES' : '❌ NO'}`)
        }
      }
    }
    
    console.log('\n\n✅ Debug complete!')
    
    // Summary
    const totalMedia = await prisma.media.count()
    const approvedMedia = await prisma.media.count({ where: { isApproved: true } })
    const publicMedia = await prisma.media.count({ where: { isPublic: true } })
    
    console.log('\n📊 Summary:')
    console.log(`   Total media records: ${totalMedia}`)
    console.log(`   Approved: ${approvedMedia}`)
    console.log(`   Public: ${publicMedia}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
debugImages()
