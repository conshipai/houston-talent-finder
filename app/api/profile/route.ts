// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Fetch user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json({ profile })
    
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { message: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT - Update user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Remove empty strings and convert to appropriate types
    const profileData = {
      stageName: body.stageName || null,
      bio: body.bio || null,
      age: body.age ? parseInt(body.age) : null,
      city: body.city || 'Houston',
      state: body.state || 'Texas',
      
      // Physical attributes
      height: body.height || null,
      weight: body.weight || null,
      measurements: body.measurements || null,
      hairColor: body.hairColor || null,
      eyeColor: body.eyeColor || null,
      ethnicity: body.ethnicity || null,
      bodyType: body.bodyType || null,
      bustSize: body.bustSize || null,
      cupSize: body.cupSize || null,
      bodyHair: body.bodyHair || null,
      tattoos: body.tattoos || false,
      tattoosDescription: body.tattoos ? (body.tattoosDescription || null) : null,
      piercings: body.piercings || false,
      piercingsDescription: body.piercings ? (body.piercingsDescription || null) : null,
      
      // Sexual orientation
      sexualOrientation: body.sexualOrientation || null,
      
      // Professional
      willingToTravel: body.willingToTravel || false,
      availability: body.availability || null,
      experience: body.experience || [],
      jobTypes: body.jobTypes || [],
      categories: body.categories || [],
      specialties: body.specialties || [],
      
      // Contact & Social
      phone: body.phone || null,
      instagram: body.instagram || null,
      twitter: body.twitter || null,
      website: body.website || null,
      
      // Adult platforms
      onlyfans: body.onlyfans || null,
      pornhubProfile: body.pornhubProfile || null,
      xhamsterProfile: body.xhamsterProfile || null,
      redtubeProfile: body.redtubeProfile || null,
    }

    // Upsert the profile (create if doesn't exist, update if exists)
    const profile = await prisma.profile.upsert({
      where: {
        userId: session.user.id
      },
      update: profileData,
      create: {
        ...profileData,
        userId: session.user.id,
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile
    })
    
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user's profile (optional)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.profile.delete({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json({
      message: 'Profile deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting profile:', error)
    return NextResponse.json(
      { message: 'Failed to delete profile' },
      { status: 500 }
    )
  }
}
