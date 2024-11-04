"use client"

import { useState } from "react"

import LoginModal from "@/components/auth/login-modal"

export default function AuthButton() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowLogin(true)}
        className="bg-green-700 hover:bg-green-600 rounded-md px-4 py-2 text-white"
      >
        Login
      </button>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  )
}
