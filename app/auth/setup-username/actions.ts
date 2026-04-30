"use server"

import { redirect } from "next/navigation"

import { isProfane } from "@/lib/profanity"
import { createClient } from "@/lib/supabase/server"

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,24}$/

export async function completeGoogleUsernameSetup(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim()

  if (!USERNAME_PATTERN.test(username)) {
    return redirect("/auth/setup-username?message=Use 3-24 letters, numbers, or underscores.")
  }

  if (isProfane(username)) {
    return redirect("/auth/setup-username?message=Username is not allowed.")
  }

  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle()

  if (existingProfile && existingProfile.id !== user.id) {
    return redirect("/auth/setup-username?message=Username is already taken.")
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      username,
      display_name: username
    },
    { onConflict: "id" }
  )

  if (profileError) {
    return redirect("/auth/setup-username?message=Could not save username.")
  }

  const { error: userError } = await supabase.auth.updateUser({
    data: { username }
  })

  if (userError) {
    return redirect("/auth/setup-username?message=Could not save username.")
  }

  return redirect("/")
}
