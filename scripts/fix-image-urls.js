const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixImageUrls() {
  try {
    console.log('Fetching all media records...')
    
    const allMedia = await prisma.media.findMany()
    console.log(`Found ${allMedia.length} media records`)
    
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    let updatedCount = 0
    
    for (const media of allMedia) {
      let needsUpdate = false
      let updates = {}
      
      // Check if URL needs fixing
      if (!media.url.startsWith(`${baseUrl}/api/images/`)) {
        // Extract the filename from the current URL if possible
        let filename = media.filename
        
        // If the URL contains the filename, extract it
        if (media.url.includes('/')) {
          const parts = media.url.split('/')
          const possibleFilename = parts[parts.length - 1]
          if (possibleFilename) {
            filename = decodeURIComponent(possibleFilename)
          }
        }
        
        updates.url = `${baseUrl}/api/images/${encodeURIComponent(filename)}`
        needsUpdate = true
      }
      
      // Check if thumbnailUrl needs fixing
      if (media.thumbnailUrl && !media.thumbnailUrl.startsWith(`${baseUrl}/api/images/`)) {
        // Extract thumbnail filename
        let thumbnailFilename = media.thumbnailUrl
        
        if (media.thumbnailUrl.includes('/')) {
          const parts = media.thumbnailUrl.split('/')
          const possibleFilename = parts[parts.length - 1]
          if (possibleFilename) {
            thumbnailFilename = decodeURIComponent(possibleFilename)
          }
        }
        
        // If we don't have a proper thumbnail filename, create one from the main filename
        if (!thumbnailFilename.includes('thumb_')) {
          const mainParts = media.filename.split('/')
          const mainFile = mainParts[mainParts.length - 1]
          thumbnailFilename = `${mainParts[0]}/thumb_${mainFile}`
        }
        
        updates.thumbnailUrl = `${baseUrl}/api/images/${encodeURIComponent(thumbnailFilename)}`
        needsUpdate = true
      }
      
      if (needsUpdate) {
        console.log(`Updating media ${media.id}:`)
        console.log(`  Old URL: ${media.url}`)
        console.log(`  New URL: ${updates.url}`)
        if (updates.thumbnailUrl) {
          console.log(`  Old Thumb: ${media.thumbnailUrl}`)
          console.log(`  New Thumb: ${updates.thumbnailUrl}`)
        }
        
        await prisma.media.update({
          where: { id: media.id },
          data: updates
        })
        
        updatedCount++
      }
    }
    
    console.log(`✅ Fixed ${updatedCount} media records`)
    
  } catch (error) {
    console.error('Error fixing URLs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixImageUrls()
