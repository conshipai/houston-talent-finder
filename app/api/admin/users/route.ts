// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const q = searchParams.get('q')?.trim() || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50))
    const skip = (page - 1) * limit

    const where: Prisma.UserWhereInput = {}
    if (role && ['TALENT', 'PRODUCER', 'ADMIN'].includes(role)) {
      where.role = role as Prisma.UserWhereInput['role']
    }
    // Search every user, not just the current page: username, email, ID, stage name or phone
    if (q) {
      const contains = { contains: q, mode: 'insensitive' as const }
      where.OR = [
        { username: contains },
        { email: contains },
        { id: q },
        { profile: { stageName: contains } },
        { profile: { phone: contains } },
      ]
    }

    const [users, total, roleCounts] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          profile: {
            select: {
              stageName: true,
              phone: true,
              age: true,
              city: true,
              state: true,
              bio: true,
              sexualOrientation: true,
              bodyType: true,
              height: true,
              weight: true,
              hairColor: true,
              eyeColor: true,
              ethnicity: true,
              jobTypes: true,
              availability: true,
              willingToTravel: true,
              instagram: true,
              twitter: true,
              website: true,
              onlyfans: true,
              verified: true,
              active: true,
              updatedAt: true
            }
          },
          media: {
            where: { isProfilePhoto: true },
            select: { url: true, thumbnailUrl: true },
            take: 1
          },
          _count: {
            select: {
              media: true,
              sentMessages: true,
              receivedMessages: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where }),
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } })
    ])

    const counts = { TALENT: 0, PRODUCER: 0, ADMIN: 0, total: 0 }
    for (const r of roleCounts) {
      counts[r.role] = r._count._all
      counts.total += r._count._all
    }

    return NextResponse.json({
      users,
      total,
      counts,
      page,
      pages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
