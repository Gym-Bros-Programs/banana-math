import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

const getSiteUrl = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!siteUrl) {
    return null
  }

  try {
    return new URL(siteUrl).toString()
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")

  const baseUrl = requestUrl.origin

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

  const siteUrl = getSiteUrl()
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1"

  // 1. If we are on Vercel, we ALWAYS want to end up on the production siteUrl
  //    (or the current baseUrl if siteUrl isn't set)
  if (isProduction) {
    return NextResponse.redirect(siteUrl || baseUrl)
  }

  // 2. If we are in local dev, but were bounced to the production domain,
  //    force it back to our local siteUrl (localhost)
  if (siteUrl && !baseUrl.includes("localhost")) {
    return NextResponse.redirect(siteUrl)
  }

  // 3. Otherwise, just stay where we are
  return NextResponse.redirect(baseUrl)
}
