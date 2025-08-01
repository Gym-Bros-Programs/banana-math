import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export default async function AuthButton() {
  const supabase = createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  // Fetch profile if the user is logged in
  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).single()
    : { data: null }

  const signOut = async () => {
    "use server"

    const supabase = createClient()
    await supabase.auth.signOut()
    return redirect("/")
  }

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-xl font-bold text-zinc-300">{profile?.full_name ?? user.email}</span>
      <form action={signOut}>
        <button className="bg-red-900 rounded-md text-l px-5 py-2 text-white font-semibold">
          Logout
        </button>
      </form>
    </div>
  ) : (
    <Link
      href="/login"
      className="bg-green-800 hover:bg-green-700 rounded-md px-5 py-2 text-white font-semibold"
    >
      Login
    </Link>
  )
}
