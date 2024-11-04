//login/login-modal.tsx
"use client"

import { useState, useTransition } from "react"

import { signIn, signUp } from "../../app/auth/actions"
import { SubmitButton } from "../../app/auth/submit-button"

const LoginModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSignIn = async (formData: FormData) => {
    startTransition(async () => {
      const result = await signIn(formData)
      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  const handleSignUp = async (formData: FormData) => {
    startTransition(async () => {
      const result = await signUp(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setError(result.message || null)
        if (result.success) {
          setTimeout(onClose, 3000) // Close after 3 seconds if successful
        }
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <form className="flex flex-col w-full justify-center gap-2 text-foreground">
          <h2 className="text-2xl font-bold mb-6">Sign In or Sign Up</h2>

          <label className="text-md" htmlFor="email">
            Email
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
            name="email"
            placeholder="you@example.com"
            required
          />

          <label className="text-md" htmlFor="password">
            Password
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          <SubmitButton
            formAction={handleSignIn}
            className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2"
            pendingText="Signing In..."
            disabled={isPending}
          >
            Sign In
          </SubmitButton>

          <SubmitButton
            formAction={handleSignUp}
            className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2"
            pendingText="Signing Up..."
            disabled={isPending}
          >
            Sign Up
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
