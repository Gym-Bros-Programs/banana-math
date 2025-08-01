"use client"
import React from "react"

type Mode = "Arithmetic" | "Geometry" | "Algebra" | "Trigonometry"

type ControlBarProps = {
  selectedMode: Mode
  onModeChange: (mode: Mode) => void
  selectedTime: number
  onTimeChange: (time: number) => void
}

export default function ControlBar({
  selectedMode,
  onModeChange,
  selectedTime,
  onTimeChange
}: ControlBarProps) {
  const modes: Mode[] = ["Arithmetic", "Geometry", "Algebra", "Trigonometry"]
  const times = [15, 30, 60, 120]

  return (
    <div className="flex items-center justify-center gap-4 bg-zinc-800 px-4 py-2 rounded-xl text-sm font-medium text-zinc-400">
      {/* Mode buttons */}
      <div className="flex items-center gap-2">
        {modes.map((mode) => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-150 ${
              selectedMode === mode
                ? "text-green-400"
                : "hover:text-zinc-200"
            }`}
          >
            {getIcon(mode)}
            <span className="capitalize">{mode}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-zinc-700 mx-2" />

      {/* Time buttons */}
      <div className="flex items-center gap-2">
        {times.map((time) => (
          <button
            key={time}
            onClick={() => onTimeChange(time)}
            className={`px-3 py-1.5 rounded-full transition-all duration-150 ${
              selectedTime === time
                ? "text-green-400"
                : "hover:text-zinc-200"
            }`}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  )
}

function getIcon(mode: string) {
  switch (mode) {
  case "time":
    return <span>⏱</span>
  case "quote":
    return <span>❝</span>
  case "zen":
    return <span>🔺</span>
  case "custom":
    return <span>🛠</span>
  case "words":
    return <span className="font-bold">A</span>
  default:
    return null
  }
}
