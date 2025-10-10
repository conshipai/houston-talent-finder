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
