"use client"

import { useEffect, useState, useTransition } from "react"

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

  // Reset error when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setError(null)
    }
  }, [isOpen])

  const handleClose = () => {
    setError(null)
    onClose()
  }

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
    setError(null)
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="bg-zinc-900 p-8 rounded-lg shadow-xl w-[800px] relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => handleClose()}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-300"
        >
          ✕
        </button>

        <div className="grid grid-cols-2 gap-8">
          {/* Sign In Form */}
          <form className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-white">Sign In</h2>

            <div className="flex flex-col gap-2">
              <label className="text-zinc-200" htmlFor="signin-email">
                Email
              </label>
              <input
                id="signin-email"
                className="w-full rounded-md px-4 py-2 bg-zinc-800 text-white border-0 focus:ring-1 focus:ring-green-500 outline-none"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-zinc-200" htmlFor="signin-password">
                Password
              </label>
              <input
                id="signin-password"
                className="w-full rounded-md px-4 py-2 bg-zinc-800 text-white border-0 focus:ring-1 focus:ring-green-500 outline-none"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex flex-col mt-2">
              <SubmitButton
                formAction={handleSignIn}
                className="w-full bg-green-800 hover:bg-green-700 rounded-md h-10 text-white font-medium transition-colors"
                pendingText="Signing In..."
                disabled={isPending}
              >
                Sign In
              </SubmitButton>
            </div>
          </form>

          {/* Sign Up Form */}
          <form className="flex flex-col gap-6 border-l border-zinc-700 pl-8">
            <h2 className="text-2xl font-bold text-white">New User Sign Up</h2>

            <div className="flex flex-col gap-2">
              <label className="text-zinc-200" htmlFor="signup-name">
                Display Name
              </label>
              <input
                id="signup-name"
                className="w-full rounded-md px-4 py-2 bg-zinc-800 text-white border-0 focus:ring-1 focus:ring-green-500 outline-none"
                name="name"
                type="text"
                placeholder="Your Name"
                required
                minLength={2}
                maxLength={50}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-zinc-200" htmlFor="signup-email">
                Email
              </label>
              <input
                id="signup-email"
                className="w-full rounded-md px-4 py-2 bg-zinc-800 text-white border-0 focus:ring-1 focus:ring-green-500 outline-none"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-zinc-200" htmlFor="signup-password">
                Password
              </label>
              <input
                id="signup-password"
                className="w-full rounded-md px-4 py-2 bg-zinc-800 text-white border-0 focus:ring-1 focus:ring-green-500 outline-none"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
                title="Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
              />
              <ul className="text-xs text-zinc-400 mt-1 list-disc pl-4 space-y-1">
                <li>At least 8 characters long</li>
                <li>Include one lowercase letter</li>
                <li>Include one uppercase letter</li>
                <li>Include one number</li>
                <li>Include one special character (!@#$%^&*)</li>
              </ul>
            </div>

            <div className="flex flex-col mt-2">
              <SubmitButton
                formAction={handleSignUp}
                className="w-full bg-orange-800 hover:bg-orange-700 rounded-md h-10 text-white font-medium transition-colors"
                pendingText="Signing Up..."
                disabled={isPending}
              >
                Sign Up
              </SubmitButton>
            </div>
          </form>
        </div>

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginModal
