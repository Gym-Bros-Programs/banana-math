"use server"

import { headers } from "next/headers"

import { createClient } from "@/utils/supabase/server"

// Track email verification status
const verificationEmails = new Map<string, number>()

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    if (error.message.includes("credentials")) {
      return {
        error:
          "The email or password you entered is incorrect. Please note that passwords are case-sensitive."
      }
    }

    if (error.message.includes("Email not confirmed")) {
      const lastSent = verificationEmails.get(email)
      const now = Date.now()

      if (lastSent && now - lastSent < 60000) {
        return {
          error: "A verification email was recently sent. Please check your inbox and spam folder."
        }
      }
      return {
        error:
          "This email address needs to be verified. Please check your inbox for the verification link."
      }
    }

    if (error.message.includes("too many requests")) {
      return {
        error:
          "For security reasons, sign in has been temporarily disabled. Please wait 5 minutes before trying again."
      }
    }

    return {
      error:
        "Our authentication service is currently unavailable. Please try again in a few minutes."
    }
  }

  return { success: true }
}

export async function signUp(formData: FormData) {
  const origin = headers().get("origin")
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const supabase = createClient()

  // Check if verification email was recently sent
  const lastSent = verificationEmails.get(email)
  const now = Date.now()

  if (lastSent && now - lastSent < 60000) {
    return {
      error: "A verification email was recently sent. Please check your inbox and spam folder."
    }
  }

  const { error: signUpError, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        display_name: name
      }
    }
  })

  if (signUpError) {
    if (signUpError.message.includes("already registered")) {
      return {
        error:
          "This email is already registered. If you haven't verified your email yet, please check your inbox for the verification link."
      }
    }

    if (signUpError.message.includes("password")) {
      return {
        error:
          "Your password must contain at least 8 characters, including uppercase, lowercase, number, and special character."
      }
    }

    if (signUpError.message.includes("valid email")) {
      return {
        error: "Please enter a valid email address (e.g., name@example.com)."
      }
    }

    if (signUpError.message.includes("rate limit")) {
      return {
        error: "Maximum signup attempts reached. Please try again after 15 minutes."
      }
    }

    return {
      error: "We're unable to create accounts right now. Please try again in a few minutes."
    }
  }

  // If user is returned but email hasn't been confirmed
  if (data?.user?.identities?.length === 0) {
    verificationEmails.set(email, now)
    return {
      error:
        "This email is already registered but not verified. Please check your inbox for the verification link."
    }
  }

  if (data?.user) {
    verificationEmails.set(email, now)

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      display_name: name,
      updated_at: new Date().toISOString()
    })

    if (profileError) {
      return {
        error:
          "You have already made an account with this email."
      }
    }

    return {
      success: true,
      message: "Verification email sent. Please check your inbox."
    }
  }

  return {
    error: "Unable to create account. Please try again."
  }
}
