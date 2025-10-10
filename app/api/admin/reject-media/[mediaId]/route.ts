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
