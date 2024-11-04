"use client"

import { useState, useTransition } from "react"

import { signIn, signUp } from "@/app/auth/actions"
import { SubmitButton } from "@/app/auth/submit-button"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const LoginModal = ({ isOpen, onClose, onSuccess }: LoginModalProps) => {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSignIn = async (formData: FormData) => {
    startTransition(async () => {
      const result = await signIn(formData)
      if (result.error) {
        setError(result.error)
      } else {
        onSuccess()
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
          setTimeout(onSuccess, 3000)
        }
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center w-full">
      <div className="absolute inset-0 w-full" onClick={onClose} />
      <div
        className="bg-zinc-900 p-8 rounded-lg shadow-xl w-[400px] relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-300"
        >
          ✕
        </button>

        <form className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-white">Sign In or Sign Up</h2>

          <div className="flex flex-col gap-2">
            <label className="text-zinc-200" htmlFor="email">
              Email
            </label>
            <input
              className="w-full rounded-md px-4 py-2 bg-zinc-800 text-white border-0 focus:ring-1 focus:ring-green-500 outline-none"
              name="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-zinc-200" htmlFor="password">
              Password
            </label>
            <input
              className="w-full rounded-md px-4 py-2 bg-zinc-800 text-white border-0 focus:ring-1 focus:ring-green-500 outline-none"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex flex-col">
            <SubmitButton
              formAction={handleSignIn}
              className="w-full bg-green-600 hover:bg-green-500 rounded-md h-10 text-white font-medium transition-colors"
              pendingText="Signing In..."
              disabled={isPending}
            >
              Sign In
            </SubmitButton>

            <SubmitButton
              formAction={handleSignUp}
              className="w-full bg-zinc-800 hover:bg-zinc-700 rounded-md h-10 text-white font-medium transition-colors"
              pendingText="Signing Up..."
              disabled={isPending}
            >
              Sign Up
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
