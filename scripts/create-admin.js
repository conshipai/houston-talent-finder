const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123456', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@talenthouston.com',
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
        ageVerified: true,
        ageVerifiedAt: new Date(),
      }
    })
    
    console.log('✅ Admin user created:')
    console.log('Email: admin@talenthouston.com')
    console.log('Password: admin123456')
    console.log('⚠️  CHANGE THIS PASSWORD IMMEDIATELY!')
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Admin user already exists')
    } else {
      console.error('Error:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
