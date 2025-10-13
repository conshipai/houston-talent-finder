// scripts/fix-r2-paths.js
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

async function fixPaths() {
  try {
    console.log('🔧 Starting R2 path fix...\n')
    
    // Get all media records
    const allMedia = await prisma.media.findMany({
      include: {
        user: true
      }
    })
    
    console.log(`Found ${allMedia.length} media records to check\n`)
    
    let fixedCount = 0
    let alreadyCorrect = 0
    
    for (const media of allMedia) {
      console.log(`\nChecking media ${media.id}`)
      console.log(`  Current filename: ${media.filename}`)
      console.log(`  User role: ${media.user.role}`)
      
      // Check if the file exists at the current path
      let exists = await checkR2Object(media.filename)
      
      if (!exists) {
        console.log(`  ❌ Not found at: ${media.filename}`)
        
        // Try with 'talent/' prefix for TALENT users
        if (media.user.role === 'TALENT') {
          const talentPath = `talent/${media.filename}`
          const talentExists = await checkR2Object(talentPath)
          
          if (talentExists) {
            console.log(`  ✅ Found at: ${talentPath}`)
            
            // Update the database
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
            const filename = media.filename.split('/').pop()
            
            await prisma.media.update({
              where: { id: media.id },
              data: {
                filename: talentPath,
                url: `${baseUrl}/api/images/${encodeURIComponent(filename)}`,
              }
            })
            
            // Also update thumbnail if it exists
            if (media.thumbnailUrl) {
              const thumbFilename = media.thumbnailUrl.split('/').pop()
              const decodedThumb = decodeURIComponent(thumbFilename)
              
              // Check if thumbnail exists with talent/ prefix
              const thumbPath = `talent/${media.user.id}/thumb_${media.filename.split('/').pop()}`
              const thumbExists = await checkR2Object(thumbPath)
              
              if (thumbExists) {
                await prisma.media.update({
                  where: { id: media.id },
                  data: {
                    thumbnailUrl: `${baseUrl}/api/images/${encodeURIComponent(decodedThumb)}`
                  }
                })
                console.log(`  ✅ Fixed thumbnail path`)
              }
            }
            
            console.log(`  📝 Updated database paths`)
            fixedCount++
          } else {
            // Try without any prefix
            const withoutPrefix = media.filename
            const directExists = await checkR2Object(withoutPrefix)
            
            if (directExists) {
              console.log(`  ✅ Found at original path: ${withoutPrefix}`)
              alreadyCorrect++
            } else {
              console.log(`  ⚠️  File not found in R2 at any expected location`)
              console.log(`     Tried:`)
              console.log(`     - ${media.filename}`)
              console.log(`     - ${talentPath}`)
            }
          }
        } else {
          console.log(`  ⚠️  File not found for non-talent user`)
        }
      } else {
        console.log(`  ✅ File exists at correct path`)
        alreadyCorrect++
      }
      
      // Also verify the URL format is correct
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const expectedUrlPrefix = `${baseUrl}/api/images/`
      
      if (!media.url.startsWith(expectedUrlPrefix)) {
        console.log(`  ⚠️  URL format needs fixing`)
        const filename = media.filename.split('/').pop()
        
        await prisma.media.update({
          where: { id: media.id },
          data: {
            url: `${baseUrl}/api/images/${encodeURIComponent(filename)}`
          }
        })
        console.log(`  📝 Fixed URL format`)
      }
    }
    
    console.log('\n' + '='.repeat(50))
    console.log('✅ Path fix complete!')
    console.log(`   Fixed: ${fixedCount} records`)
    console.log(`   Already correct: ${alreadyCorrect} records`)
    console.log(`   Total processed: ${allMedia.length} records`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixPaths()
