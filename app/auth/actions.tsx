"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export async function signIn(formData: FormData) {
  const identifier = formData.get("identifier") as string
  const password = formData.get("password") as string
  
  let email = identifier
  
  // If not an email and we are not in mock auth mode, lookup the email by username
  if (!identifier.includes("@") && process.env.NEXT_PUBLIC_MOCK_AUTH !== "true") {
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js")
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )
    const { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('username', identifier).single()
    if (!profile) {
      return redirect("/login?message=Invalid login credentials.")
    }
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(profile.id)
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
    return redirect("/login?message=Could not authenticate user.")
  }

  return redirect("/")
}

import { isProfane } from "@/lib/profanity"

export async function signUp(formData: FormData) {
  const origin = headers().get("origin")
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const username = formData.get("username") as string

  if (isProfane(username)) {
    return redirect("/login?message=Username contains restricted or inappropriate language.")
  }

  const supabase = createClient()

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

export async function signInWithGoogle() {
  const isMockDb = process.env.NEXT_PUBLIC_MOCK_DB === "true"
  const isMockAuth = process.env.NEXT_PUBLIC_MOCK_AUTH === "true"
  
  if (isMockDb || isMockAuth) {
    return redirect("/login?message=Google Sign In is not available during local testing.")
  }

  const origin = headers().get("origin")
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return redirect("/login?message=Could not authenticate with Google")
  }

  if (data.url) {
    return redirect(data.url)
  }
}
