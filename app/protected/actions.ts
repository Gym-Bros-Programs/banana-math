"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export async function updateDisplayName(formData: FormData) {
  const displayName = String(formData.get("display_name") ?? "").trim()
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName || null })
    .eq("id", user.id)

  if (error) {
    return redirect("/protected?message=Could not update profile.")
  }

  revalidatePath("/protected")
  return redirect("/protected")
}

export async function updateProfilePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "")

  if (!password) {
    return redirect("/protected?message=Enter a new password.")
  }

  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return redirect("/protected?message=Could not update password.")
  }

  return redirect("/protected?message=Password updated.")
}
