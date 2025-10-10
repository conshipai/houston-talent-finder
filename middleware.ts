// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

// Protect these routes - add talent profiles
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",      // User's own profile editing
    "/media/:path*",        // User's media management
    "/settings/:path*",     // User settings
    "/messages/:path*",     // Messages
    "/admin/:path*",        // Admin pages
    "/talent/:path*",       // PROTECTED - Talent profiles require login
    "/browse/:path*",       // PROTECTED - Browse page requires login
    "/api/upload/:path*",
    "/api/profile/:path*",
    "/api/messages/:path*",
    "/api/admin/:path*",
    "/api/talents/:path*",  // PROTECTED - API also requires auth
  ],
}
