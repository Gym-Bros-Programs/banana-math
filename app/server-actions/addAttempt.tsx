"use server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/utils/supabase/server"

export default async function addAttempt(correct_count: number, total_count: number) {
  const supabase = createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  //console.log("User:", user?.id);

  if (!user) {
    return redirect("/")
  }

  const { data: _data, error } = await supabase // Changed 'data' to '_data'
    .from("entries")
    .insert([
      {
        correct_count: correct_count,
        total_count: total_count,
        user_id: user?.id,
        user_email: user?.email,
        percentage: ((correct_count / total_count) * 100).toFixed(2)
      }
    ])
    .select()

  if (error) {
    console.error("Error inserting data", error)
    return
  }

  revalidatePath("/attempts")

  return { message: "Success" }
}
