const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function makeAdmin() {
  const email = process.argv[2]
  
  if (!email) {
    console.log('Usage: node scripts/make-admin.js user@email.com')
    process.exit(1)
  }
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    
    console.log(`✅ User ${user.username} (${user.email}) is now an ADMIN`)
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()
