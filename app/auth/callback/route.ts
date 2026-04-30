import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")

  // Get the host from headers which will be correct in both dev and prod
  const host = request.headers.get("host") || ""
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https"

  // Construct the base URL
  const baseUrl = `${protocol}://${host}`

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(
        `${baseUrl}/login?message=Could not confirm authentication link.`
      )
    }
  }

  if (next?.startsWith("/")) {
    return NextResponse.redirect(`${baseUrl}${next}`)
  }

  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user && !user.user_metadata?.username) {
    return NextResponse.redirect(`${baseUrl}/auth/setup-username`)
  }

  // Alternative 1: Using environment variable (recommended)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL)
  }

  // Alternative 2: Using constructed URL
  return NextResponse.redirect(baseUrl)
}
