// lib/admin-auth.ts
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function isAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'ADMIN'
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized - Login required' },
      { status: 401 }
    )
  }
  
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    )
  }
  
  return null // Continue if admin
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role === 'ADMIN') {
    return session
  }
  return null
}
