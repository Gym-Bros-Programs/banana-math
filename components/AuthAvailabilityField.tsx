"use client"

import { useEffect, useRef, useState, type InputHTMLAttributes } from "react"
import { isProfane } from "@/lib/profanity"

type AvailabilityKind = "username" | "email"

type AuthAvailabilityFieldProps = {
  name: string
  label: string
  availabilityKind: AvailabilityKind
  unavailableMessage: string
  type?: string
  placeholder?: string
  className?: string
  props?: InputHTMLAttributes<HTMLInputElement>
}

export function AuthAvailabilityField({
  name,
  label,
  availabilityKind,
  unavailableMessage,
  type = "text",
  placeholder = "",
  className = "w-full rounded-sm px-4 py-3 bg-[#17150F] text-[#EDE6DA] border border-[#2C2920] focus:border-[hsl(50,100%,52%)] focus:outline-none transition-colors",
  props = {}
}: AuthAvailabilityFieldProps) {
  const [value, setValue] = useState("")
  const [availabilityStatus, setAvailabilityStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const [isFocused, setIsFocused] = useState(false)
  const [touched, setTouched] = useState(false)
  const requestIdRef = useRef(0)

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  const checkAvailability = async (nextValue = value) => {
    const trimmedValue = nextValue.trim()
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    if (!trimmedValue) {
      setAvailabilityStatus("idle")
      return
    }

    if (availabilityKind === "username") {
      if (trimmedValue.length < 3 || isProfane(trimmedValue)) {
        setAvailabilityStatus("idle")
        return
      }
    } else if (availabilityKind === "email") {
      if (!isValidEmail(trimmedValue)) {
        setAvailabilityStatus("idle")
        return
      }
    }

    setAvailabilityStatus("checking")

    try {
      const params = new URLSearchParams({ [availabilityKind]: trimmedValue })
      const response = await fetch(`/auth/availability?${params.toString()}`)
      const data = await response.json()

      if (requestIdRef.current !== requestId) return

      const isAvailable = data?.[availabilityKind]?.available !== false
      setAvailabilityStatus(isAvailable ? "available" : "taken")
    } catch (error) {
      if (requestIdRef.current !== requestId) return
      setAvailabilityStatus("idle")
    }
  }

  const getRequirementColor = (fulfilled: boolean, isAvailability: boolean, label: string) => {
    const trimmed = value.trim()
    
    if (isAvailability) {
      if (availabilityStatus === "taken") return "text-red-300"
      if (availabilityStatus === "checking") return "text-[#5C5750]"
      return "text-[#C8BCAD]"
    }

    if (trimmed === "") {
      if (label.includes("characters") || label.includes("format")) {
        return "text-red-300"
      }
      return "text-[#C8BCAD]"
    }

    return fulfilled ? "text-[#C8BCAD]" : "text-red-300"
  }

  useEffect(() => {
    if (!value.trim()) {
      setAvailabilityStatus("idle")
      return
    }

    const timeout = window.setTimeout(() => {
      void checkAvailability(value)
    }, 5000) // Back to 5s as requested

    return () => window.clearTimeout(timeout)
  }, [value])

  const baseChecks = {
    username: [
      { label: "At least 3 characters", fulfilled: value.trim().length >= 3 },
      { label: "No inappropriate language", fulfilled: value.trim() === "" || !isProfane(value.trim()) }
    ],
    email: [
      { label: "Valid email format", fulfilled: isValidEmail(value.trim()) }
    ]
  }[availabilityKind]

  const checkResults = baseChecks.map(check => ({
    ...check,
    color: getRequirementColor(check.fulfilled, false, check.label)
  }))

  // Only add the availability check result if it's NOT available (i.e., it's checking or taken)
  if (availabilityStatus === "checking") {
    checkResults.push({
      label: "Checking availability...",
      fulfilled: false,
      color: "text-[#5C5750]"
    })
  } else if (availabilityStatus === "taken") {
    checkResults.push({
      label: unavailableMessage,
      fulfilled: false,
      color: "text-red-300"
    })
  }

  const hasErrors = checkResults.some(check => check.color === "text-red-300")
  const isVisible = isFocused || (touched && hasErrors)

  return (
    <div className="relative group">
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-[#C8BCAD] uppercase tracking-wider"
          htmlFor={name}
        >
          {label}
        </label>
        <input
          id={name}
          className={className}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onFocus={() => {
            setIsFocused(true)
            setTouched(true)
          }}
          onBlur={() => {
            setIsFocused(false)
            void checkAvailability()
          }}
          onChange={(event) => {
            setValue(event.target.value)
            setAvailabilityStatus("idle")
            setTouched(true)
          }}
          required
          {...props}
        />
      </div>

      <div className={`absolute left-full top-0 ml-6 w-64 p-4 bg-[#211E17] border border-[#2C2920] rounded-sm ${isVisible ? "block" : "hidden"} z-50 shadow-2xl before:content-[''] before:absolute before:top-4 before:-left-2 before:w-4 before:h-4 before:bg-[#211E17] before:border-l before:border-b before:border-[#2C2920] before:rotate-45`}>
        <ul className="text-xs list-disc pl-4 space-y-1 relative z-10">
          {checkResults.map((check, index) => (
            <li 
              key={`${name}-check-${index}`}
              className={check.color}
            >
              {check.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
