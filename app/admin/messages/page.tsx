// prisma/schema.prisma - ADD THESE TO YOUR EXISTING SCHEMA

model Message {
  id          String   @id @default(cuid())
  senderId    String
  sender      User     @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  receiverId  String
  receiver    User     @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)
  
  subject     String?
  content     String
  isRead      Boolean  @default(false)
  isArchived  Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([receiverId, isRead])
  @@index([senderId])
}

// Update User model to include messages relations
model User {
  // ... existing fields ...
  
  sentMessages     Message[]  @relation("SentMessages")
  receivedMessages Message[]  @relation("ReceivedMessages")
}

// -------------------------------------------
// Create a new file: scripts/make-admin.js

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

// -------------------------------------------
// Create a new file: scripts/create-admin.js

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
