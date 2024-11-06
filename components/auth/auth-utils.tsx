"use server"

import { createClient } from "@/utils/supabase/server"

export async function getSession() {
  const supabase = createClient()
  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}
