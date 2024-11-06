import { type NextRequest, NextResponse } from "next/server"

import { updateSession } from "@/utils/supabase/middleware"

export async function middleware(request: NextRequest) {
  const res = await updateSession(request)

  // Get the pathname of the request
  const pathname = request.nextUrl.pathname

  // Protected routes that require authentication
  const protectedPaths = ["/protected", "/settings", "/profile"]
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  // Get session from response headers
  const supabaseSession = res.headers.get("x-supabase-session")
  const hasSession = !!supabaseSession && supabaseSession !== "null"

  // If trying to access protected route without session, redirect to home
  if (isProtectedPath && !hasSession) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
}
