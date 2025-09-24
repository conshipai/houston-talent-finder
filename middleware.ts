import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

// Protect these routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/media/:path*",
    "/settings/:path*",
    "/api/upload/:path*",
    "/api/profile/:path*",
  ],
}
