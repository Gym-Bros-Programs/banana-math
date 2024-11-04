"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { createClient } from "@/utils/supabase/client"

import LoginModal from "./auth/login-modal"

export default function AuthButton({ session }: { session: any }) {
  const [showLogin, setShowLogin] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold text-zinc-300">{session.user.user_metadata?.display_name || session.user.email}</span>
        <button onClick={handleSignOut} className=" bg-red-900 rounded-md text-l px-5 py-2 text-white font-semibold">
          Logout
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowLogin(true)}
        className="bg-green-800 hover:bg-green-700 rounded-md px-5 py-2 text-white font-semibold"
      >
        Login
      </button>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          setShowLogin(false)
          router.refresh()
        }}
      />
    </>
  )
}
