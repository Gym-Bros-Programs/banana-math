import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  // Get the host from headers which will be correct in both dev and prod
  const host = request.headers.get("host") || ""
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https"

  // Construct the base URL
  const baseUrl = `${protocol}://${host}`

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Alternative 1: Using environment variable (recommended)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL)
  }

  // Alternative 2: Using constructed URL
  return NextResponse.redirect(baseUrl)
}
