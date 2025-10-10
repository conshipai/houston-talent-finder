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
    "/profile/:path*",
    "/media/:path*",
    "/settings/:path*",
    "/messages/:path*",
    "/talent/:path*",        // Add this line to protect talent profiles
    "/browse/:path*",        // Add this if you have a browse page
    "/api/upload/:path*",
    "/api/profile/:path*",
    "/api/messages/:path*",
  ],
}
