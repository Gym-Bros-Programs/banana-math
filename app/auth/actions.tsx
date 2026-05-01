"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { checkAuthAvailability } from "@/lib/auth/availability"
import { isProfane } from "@/lib/profanity"
import { createClient } from "@/lib/supabase/server"

export async function signIn(formData: FormData) {
  const identifier = formData.get("identifier") as string
  const password = formData.get("password") as string

  let email = identifier

  // If not an email and we are not in mock auth mode, lookup the email by username
  if (!identifier.includes("@") && process.env.NEXT_PUBLIC_MOCK_AUTH !== "true") {
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js")

    const isCloud = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("supabase.co")
    const serviceKey = isCloud
      ? process.env.SUPABASE_SERVICE_KEY_PROD || process.env.SUPABASE_SERVICE_KEY
      : process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY_PROD

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !serviceKey) {
      console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY for admin lookup")
      return redirect("/login?message=System configuration error: Missing auth keys.")
    }

    const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", identifier)
      .single()
    if (!profile) {
      console.log(`Username lookup failed for: ${identifier}`)
      return redirect("/login?message=Invalid login credentials.")
    }
    const {
      data: { user }
    } = await supabaseAdmin.auth.admin.getUserById(profile.id)
    if (!user || !user.email) {
      return redirect("/login?message=Invalid login credentials.")
    }
    email = user.email
  }

  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error("Sign in error:", error)
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return redirect("/login?message=Check your email to confirm your account before signing in.")
    }
    return redirect("/login?message=Could not authenticate user.")
  }

  return redirect("/")
}

export async function signUp(formData: FormData) {
  const origin = headers().get("origin")
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const username = String(formData.get("username") ?? "").trim()

  if (isProfane(username)) {
    return redirect("/login?message=Username contains restricted or inappropriate language.")
  }

  const availability = await checkAuthAvailability({ username, email })

  if (availability.email?.available === false) {
    return redirect("/login?message=An account already exists for this email. Sign in instead.")
  }

  if (availability.username?.available === false) {
    return redirect("/login?message=Username is already taken.")
  }

  const supabase = createClient()

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle()

  if (existingProfile) {
    return redirect("/login?message=Username is already taken.")
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        username: username
      }
    }
  })

  if (error) {
    console.error("Sign up error:", error)
    return redirect("/login?message=Could not authenticate user. Please try again.")
  }

  return redirect("/login?message=Check your email to continue signing up.")
}

export async function requestPasswordReset(formData: FormData) {
  const origin = headers().get("origin")
  const email = formData.get("email") as string
  if (!email) {
    return redirect("/login?message=Enter your email to reset your password.")
  }

  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`
  })

  if (error) {
    console.error("Password reset error:", error)
    return redirect("/login?message=Could not send password reset email.")
  }

  return redirect("/login?message=Check your email for a password reset link.")
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string
  if (!password) {
    return redirect("/auth/reset-password?message=Enter a new password.")
  }

  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password
  })

  if (error) {
    console.error("Update password error:", error)
    return redirect("/auth/reset-password?message=Could not update password.")
  }

  return redirect("/login?message=Password updated. Please sign in.")
}

export async function signInWithGoogle() {
  const isGoogleAuthEnabled =
    process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true" ||
    (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("supabase.co") &&
      process.env.NEXT_PUBLIC_DISABLE_GOOGLE_AUTH !== "true")

  if (!isGoogleAuthEnabled) {
    return redirect("/login?message=Google Sign In is not available.")
  }

  const origin = headers().get("origin")
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`
    }
  })

  if (error) {
    return redirect("/login?message=Could not authenticate with Google")
  }

  if (data.url) {
    return redirect(data.url)
  }
}
