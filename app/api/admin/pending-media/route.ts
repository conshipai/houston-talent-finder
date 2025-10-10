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
