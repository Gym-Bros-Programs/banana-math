import { NextResponse } from "next/server"

import { checkAuthAvailability } from "@/lib/auth/availability"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const username = url.searchParams.get("username") ?? undefined
  const email = url.searchParams.get("email") ?? undefined

  return NextResponse.json(await checkAuthAvailability({ username, email }))
}
