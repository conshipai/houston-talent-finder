// app/api/admin/approve-profile/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    // Create or update profile to set verified = true
    await prisma.profile.upsert({
      where: {
        userId: params.userId
      },
      update: {
        verified: true
      },
      create: {
        userId: params.userId,
        verified: true
      }
    })

    // Also approve all their media
    await prisma.media.updateMany({
      where: {
        userId: params.userId
      },
      data: {
        isApproved: true
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to approve profile' },
      { status: 500 }
    )
  }
}
