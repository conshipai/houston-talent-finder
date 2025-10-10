// app/api/admin/reject-profile/[userId]/route.ts
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
    // Update profile to set verified = false
    await prisma.profile.upsert({
      where: {
        userId: params.userId
      },
      update: {
        verified: false
      },
      create: {
        userId: params.userId,
        verified: false
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reject profile' },
      { status: 500 }
    )
  }
}
