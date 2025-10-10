// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const [
      totalUsers,
      pendingProfiles,
      pendingPhotos,
      activeProducers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          role: 'TALENT',
          profile: {
            verified: false
          }
        }
      }),
      prisma.media.count({
        where: {
          isApproved: false
        }
      }),
      prisma.user.count({
        where: {
          role: 'PRODUCER'
        }
      })
    ])

    return NextResponse.json({
      totalUsers,
      pendingProfiles,
      pendingPhotos,
      activeProducers
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
