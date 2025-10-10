// app/api/admin/pending-profiles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const profiles = await prisma.user.findMany({
      where: {
        role: 'TALENT',
        OR: [
          { profile: { verified: false } },
          { profile: null }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            media: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedProfiles = profiles.map(p => ({
      id: p.id,
      username: p.username,
      email: p.email,
      createdAt: p.createdAt,
      mediaCount: p._count.media
    }))

    return NextResponse.json({ profiles: formattedProfiles })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}
