"use client"

import { useRouter } from "next/navigation"
import React, { useState, useRef, useEffect } from "react"

export type FilterOption = {
  label: string
  key: string
  type?: "toggle" | "dropdown"
  values: { label: string; value: string }[]
}

interface FilterBarProps {
  options: FilterOption[]
  currentParams?: Record<string, string | undefined>
}

export default function FilterBar({ options, currentParams = {} }: FilterBarProps) {
  const router = useRouter()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleFilter(key: string, value: string) {
    const params = new URLSearchParams(
      Object.entries(currentParams).filter(([, v]) => v != null) as [string, string][]
    )
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`?${params.toString()}`)
    setOpenDropdown(null)
  }

  return (
    <div className="flex flex-wrap gap-10 py-6 border-b border-[#2C2920]">
      {options.map((opt) => {
        const type = opt.type || "toggle"
        const currentValue = currentParams[opt.key] || "all"
        const currentLabel = opt.values.find((v) => v.value === currentValue)?.label || "All"

        return (
          <div key={opt.key} className="flex flex-col gap-1.5 relative">
            <span className="text-[10px] uppercase tracking-widest text-[#C8BCAD] font-bold ml-1">
              {opt.label}
            </span>

            {type === "toggle" ? (
              <div className="flex gap-1 bg-[#17150F] p-1 rounded-lg border border-[#2C2920]">
                {opt.values.map((v) => {
                  const isActive = currentValue === v.value
                  return (
                    <button
                      key={v.value}
                      onClick={() => handleFilter(opt.key, v.value)}
                      className={`px-3 py-1 text-xs rounded-md transition-all ${
                        isActive
                          ? "bg-btn-background text-black font-bold shadow-sm"
                          : "text-[#C8BCAD] hover:text-[#EDE6DA] hover:bg-[#211E17]"
                      }`}
                    >
                      {v.label}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="relative" ref={opt.key === openDropdown ? dropdownRef : null}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === opt.key ? null : opt.key)}
                  className="flex items-center gap-3 bg-[#17150F] px-4 py-1.5 text-xs rounded-lg border border-[#2C2920] text-[#EDE6DA] hover:border-[#C8BCAD] transition-all w-48"
                >
                  <span className="flex-1 text-left">{currentLabel}</span>
                  <svg
                    className={`w-3 h-3 text-[#C8BCAD] transition-transform ${openDropdown === opt.key ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {openDropdown === opt.key && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-[#17150F] border border-[#2C2920] rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="max-h-60 overflow-y-auto py-1">
                      {opt.values.map((v) => {
                        const isActive = currentValue === v.value
                        return (
                          <button
                            key={v.value}
                            onClick={() => handleFilter(opt.key, v.value)}
                            className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                              isActive
                                ? "bg-btn-background text-black font-bold"
                                : "text-[#C8BCAD] hover:text-[#EDE6DA] hover:bg-[#211E17]"
                            }`}
                          >
                            {v.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
