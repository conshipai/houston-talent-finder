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
