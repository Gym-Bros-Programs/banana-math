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
  if (siteUrl) {
    return NextResponse.redirect(siteUrl)
  }

  return NextResponse.redirect(baseUrl)
}
