// app/api/admin/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const session = await getAdminSession()
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  return NextResponse.json({ admin: true })
}

// -------------------------------------------
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

// -------------------------------------------
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

// -------------------------------------------
// app/api/admin/pending-media/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const media = await prisma.media.findMany({
      where: {
        isApproved: false
      },
      include: {
        user: {
          select: {
            username: true,
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    const formattedMedia = media.map(m => ({
      id: m.id,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl,
      username: m.user.username,
      userId: m.user.id,
      uploadedAt: m.createdAt,
      type: m.type
    }))

    return NextResponse.json({ media: formattedMedia })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

// -------------------------------------------
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

// -------------------------------------------
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

// -------------------------------------------
// app/api/admin/approve-media/[mediaId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { mediaId: string } }
) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    await prisma.media.update({
      where: {
        id: params.mediaId
      },
      data: {
        isApproved: true
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to approve media' },
      { status: 500 }
    )
  }
}

// -------------------------------------------
// app/api/admin/reject-media/[mediaId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { mediaId: string } }
) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    // Delete the media record (you might want to just mark as rejected instead)
    await prisma.media.delete({
      where: {
        id: params.mediaId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reject media' },
      { status: 500 }
    )
  }
}
