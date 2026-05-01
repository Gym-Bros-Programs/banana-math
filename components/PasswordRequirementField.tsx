"use client"

import { useState } from "react"

const PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$"

type PasswordRequirementFieldProps = {
  className?: string
}

export function PasswordRequirementField({
  className = "w-full rounded-sm px-4 py-3 bg-[#17150F] text-[#EDE6DA] border border-[#2C2920] focus:border-[hsl(50,100%,52%)] focus:outline-none transition-colors"
}: PasswordRequirementFieldProps) {
  const [password, setPassword] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [touched, setTouched] = useState(false)

  const checks = {
    hasMinLength: password.length >= 8,
    hasLowerAndUpper: /[a-z]/.test(password) && /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password)
  }

  const checkResults = [
    { label: "At least 8 characters long", fulfilled: checks.hasMinLength },
    { label: "Include one lowercase & one uppercase letter", fulfilled: checks.hasLowerAndUpper },
    { label: "Include one number", fulfilled: checks.hasNumber },
    { label: "Include one special character (!@#$%^&*)", fulfilled: checks.hasSpecial }
  ]

  const hasErrors = checkResults.some((check) => !check.fulfilled)
  const isVisible = isFocused || (touched && hasErrors)

  const requirementClass = (fulfilled: boolean) => (fulfilled ? "text-[#C8BCAD]" : "text-red-300")

  return (
    <div className="relative group">
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-[#C8BCAD] uppercase tracking-wider"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onFocus={() => {
            setIsFocused(true)
            setTouched(true)
          }}
          onBlur={() => setIsFocused(false)}
          onChange={(event) => {
            setPassword(event.target.value)
            setTouched(true)
          }}
          pattern={PASSWORD_PATTERN}
          title="Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
          className={className}
          required
        />
      </div>

      <div
        className={`absolute left-full top-0 ml-6 w-64 p-4 bg-[#211E17] border border-[#2C2920] rounded-sm ${isVisible ? "block" : "hidden"} z-50 shadow-2xl before:content-[''] before:absolute before:top-4 before:-left-2 before:w-4 before:h-4 before:bg-[#211E17] before:border-l before:border-b before:border-[#2C2920] before:rotate-45`}
      >
        <ul className="text-xs list-disc pl-4 space-y-1 relative z-10">
          {checkResults.map((check, index) => (
            <li key={index} className={requirementClass(check.fulfilled)}>
              {check.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
