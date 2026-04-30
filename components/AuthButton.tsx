import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

const TEXT_CLASS =
  "text-[#EDE6DA] hover:text-btn-background hover:bg-btn-background/[0.05] transition-all duration-200 text-2xl font-bold px-8 py-3 rounded-md"

export default async function AuthButton() {
  const supabase = createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  // Fetch profile if the user is logged in
  const { data: profile } = user
    ? await supabase.from("profiles").select("display_name").eq("id", user.id).single()
    : { data: null }

  const signOut = async () => {
    "use server"

    const supabase = createClient()
    await supabase.auth.signOut()
    return redirect("/")
  }

  return user ? (
    <div className="flex items-center gap-2">
      <Link href="/protected" className={TEXT_CLASS}>
        {profile?.display_name ?? user.email}
      </Link>
      <form action={signOut}>
        <button className="bg-[#5C1A1A] hover:bg-[#7A2323] transition-colors rounded-md text-2xl px-6 py-2 text-[#EDE6DA] font-bold ml-2">
          Logout
        </button>
      </form>
    </div>
  ) : (
    <Link
      href="/login"
      className="bg-btn-background hover:bg-btn-background-hover rounded-md px-6 py-2 text-2xl text-black font-bold"
    >
      Login
    </Link>
  )
}
