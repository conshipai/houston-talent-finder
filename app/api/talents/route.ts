// app/api/talents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { buildImageRequestPath } from '@/lib/media'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Get only approved talent profiles with at least one approved photo
    const [talents, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: 'TALENT',
          profile: {
            verified: true  // Only show verified profiles
          },
          media: {
            some: {
              isApproved: true,
              isPublic: true
            }
          }
        },
        select: {
          id: true,
          username: true,
          profile: {
            select: {
              stageName: true,
              bio: true,
              age: true,
              city: true,
              state: true,
              verified: true,
              bodyType: true,
              hairColor: true,
              eyeColor: true,
              ethnicity: true,
              bustSize: true,
              cupSize: true,
              sexualOrientation: true,
              jobTypes: true,
              availability: true,
              willingToTravel: true
            }
          },
          media: {
            where: {
              isApproved: true,
              isPublic: true
            },
            select: {
              id: true,
              url: true,
              thumbnailUrl: true,
              isProfilePhoto: true
            },
            orderBy: {
              isProfilePhoto: 'desc'
            },
            take: 5  // Limit media per user for performance
          }
        },
        orderBy: [
          {
            profile: {
              featured: 'desc'  // Featured profiles first
            }
          },
          {
            createdAt: 'desc'  // Then newest
          }
        ],
        skip,
        take: limit
      }),
      // Get total count for pagination
      prisma.user.count({
        where: {
          role: 'TALENT',
          profile: {
            verified: true
          },
          media: {
            some: {
              isApproved: true,
              isPublic: true
            }
          }
        }
      })
    ])
    const normalizedTalents = talents.map(talent => ({
      ...talent,
      media: talent.media.map(media => ({
        ...media,
        url: buildImageRequestPath(media.url) ?? media.url,
        thumbnailUrl: buildImageRequestPath(media.thumbnailUrl) ?? media.thumbnailUrl,
      })),
    }))
    
    return NextResponse.json({
      talents: normalizedTalents,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
    
  } catch (error) {
    console.error('Error fetching talents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch talents' },
      { status: 500 }
    )
  }
}

// Optional: Add search/filter endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      searchTerm, 
      city, 
      orientation, 
      bodyType, 
      ethnicity,
      jobTypes,
      ageMin,
      ageMax,
      page = 1,
      limit = 12
    } = body
    
    const skip = (page - 1) * limit

    // Build where clause dynamically
    const where: any = {
      role: 'TALENT',
      profile: {
        verified: true,
        ...(city && { city: { contains: city, mode: 'insensitive' } }),
        ...(orientation && { sexualOrientation: orientation }),
        ...(bodyType && { bodyType }),
        ...(ethnicity && { ethnicity }),
        ...(jobTypes && jobTypes.length > 0 && {
          jobTypes: {
            hasSome: jobTypes
          }
        }),
        ...(ageMin || ageMax ? {
          AND: [
            ...(ageMin ? [{ age: { gte: ageMin } }] : []),
            ...(ageMax ? [{ age: { lte: ageMax } }] : [])
          ]
        } : {})
      },
      media: {
        some: {
          isApproved: true,
          isPublic: true
        }
      }
    }

    // Add search term if provided
    if (searchTerm) {
      where.OR = [
        { username: { contains: searchTerm, mode: 'insensitive' } },
        { profile: { stageName: { contains: searchTerm, mode: 'insensitive' } } },
        { profile: { bio: { contains: searchTerm, mode: 'insensitive' } } }
      ]
    }

    const [talents, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          profile: {
            select: {
              stageName: true,
              bio: true,
              age: true,
              city: true,
              state: true,
              verified: true,
              bodyType: true,
              hairColor: true,
              eyeColor: true,
              ethnicity: true,
              bustSize: true,
              cupSize: true,
              sexualOrientation: true,
              jobTypes: true,
              availability: true,
              willingToTravel: true
            }
          },
          media: {
            where: {
              isApproved: true,
              isPublic: true
            },
            select: {
              id: true,
              url: true,
              thumbnailUrl: true,
              isProfilePhoto: true
            },
            orderBy: {
              isProfilePhoto: 'desc'
            },
            take: 5
          }
        },
        orderBy: [
          {
            profile: {
              featured: 'desc'
            }
          },
          {
            createdAt: 'desc'
          }
        ],
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

        const normalizedTalents = talents.map(talent => ({
      ...talent,
      media: talent.media.map(media => ({
        ...media,
        url: buildImageRequestPath(media.url) ?? media.url,
        thumbnailUrl: buildImageRequestPath(media.thumbnailUrl) ?? media.thumbnailUrl,
      })),
    }))

    return NextResponse.json({
      talents: normalizedTalents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      filters: {
        searchTerm,
        city,
        orientation,
        bodyType,
        ethnicity,
        jobTypes,
        ageMin,
        ageMax
      }
    })
    
  } catch (error) {
    console.error('Error searching talents:', error)
    return NextResponse.json(
      { error: 'Failed to search talents' },
      { status: 500 }
    )
  }
}
