// login/actions.tsx
"use server"

import { headers } from "next/headers"

import { createClient } from "@/utils/supabase/server"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { error: "Could not authenticate user" }
  }

  return { success: true }
}

export async function signUp(formData: FormData) {
  const origin = headers().get("origin")
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createClient()

  // Validate password
  const messages = []
  if (password.length < 8) {
    messages.push("Password must be at least 8 characters")
  }
  if (!/[a-z]/.test(password)) {
    messages.push("Password must contain a lowercase letter")
  }
  if (!/[A-Z]/.test(password)) {
    messages.push("Password must contain an uppercase letter")
  }
  if (!/[0-9]/.test(password)) {
    messages.push("Password must contain a number")
  }
  if (!/[!@#$%^&*]/.test(password)) {
    messages.push("Password must contain a special character")
  }
  if (messages.length > 0) {
    return { error: messages.join(", ") }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`
    }
  })

  if (error) {
    return { error: "Could not authenticate user" }
  }

  return { success: true, message: "Check email to continue sign in process" }
}
