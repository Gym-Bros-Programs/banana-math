"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface FilterBarProps {
  options: {
    label: string
    key: string
    values: { label: string, value: string }[]
  }[]
}

export default function FilterBar({ options }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-10 py-6 border-b border-[#2C2920]">
      {options.map((opt) => (
        <div key={opt.key} className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-[#C8BCAD] font-bold ml-1">
            {opt.label}
          </span>
          <div className="flex gap-1 bg-[#17150F] p-1 rounded-lg border border-[#2C2920]">
            {opt.values.map((v) => {
              const isActive = (searchParams.get(opt.key) || "all") === v.value
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
        </div>
      ))}
    </div>
  )
}
