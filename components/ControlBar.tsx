"use client"
import React from "react"

export type Type = "+ − × ÷" | "+ −" | "× ÷" | "+ only" | "− only" | "× only" | "÷ only"

export type Difficulty = "Easy" | "Medium" | "Hard"
export type Mode = "timed" | "question based"

const TYPES: Type[] = ["+ − × ÷", "+ −", "× ÷", "+ only", "− only", "× only", "÷ only"]
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"]
const SECONDS_OPTIONS = [15, 30, 60, 120]
const QUESTIONS_OPTIONS = [10, 20, 50, 100]

type ControlBarProps = {
  selectedType: Type
  onTypeChange: (t: Type) => void
  selectedDifficulty: Difficulty
  onDifficultyChange: (d: Difficulty) => void
  selectedLength: number
  onLengthChange: (length: number) => void
  selectedMode: Mode
  onModeChange: (m: Mode) => void
}

function VerticalPicker<T extends string>({
  options,
  selected,
  onChange
}: {
  options: T[]
  selected: T
  onChange: (val: T) => void
}) {
  const currentIndex = options.indexOf(selected)
  const middleOffset = 50 * options.length
  const [vIdx, setVIdx] = React.useState(middleOffset + currentIndex)

  React.useEffect(() => {
    const mod = ((vIdx % options.length) + options.length) % options.length
    if (mod !== currentIndex) setVIdx(middleOffset + currentIndex)
  }, [currentIndex, options.length, middleOffset, vIdx])

  const handleUp = () => {
    setVIdx((v) => v - 1)
    onChange(options[currentIndex === 0 ? options.length - 1 : currentIndex - 1])
  }
  const handleDown = () => {
    setVIdx((v) => v + 1)
    onChange(options[currentIndex === options.length - 1 ? 0 : currentIndex + 1])
  }

  const repeated = React.useMemo(() => Array(100).fill(options).flat(), [options])

  return (
    <div className="flex flex-col items-center justify-center w-44">
      <button
        onClick={handleUp}
        className="text-muted p-1 transition-colors hover:text-btn-background"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
      <div className="relative h-10 w-full overflow-hidden my-1">
        <div
          className="absolute w-full flex flex-col transition-transform duration-300 ease-in-out"
          style={{ transform: `translateY(-${vIdx * 40}px)` }}
        >
          {repeated.map((opt, i) => (
            <div
              key={i}
              className="h-10 flex items-center justify-center text-[hsl(50,100%,52%)] text-3xl font-medium w-full text-center truncate select-none"
            >
              {opt}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={handleDown}
        className="text-muted p-1 transition-colors hover:text-btn-background"
      >
        <svg
          width="24"
          height="24"
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
    </div>
  )
}

export default function ControlBar({
  selectedType,
  onTypeChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedLength,
  onLengthChange,
  selectedMode,
  onModeChange
}: ControlBarProps) {
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const settingsRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handle(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node))
        setSettingsOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  const lengthOptions = selectedMode === "timed" ? SECONDS_OPTIONS : QUESTIONS_OPTIONS

  // If current selectedLength isn't in the new set, auto-pick the first option
  React.useEffect(() => {
    if (!lengthOptions.includes(selectedLength)) onLengthChange(lengthOptions[0])
  }, [selectedMode, lengthOptions, onLengthChange, selectedLength])

  return (
    <div className="relative flex items-center justify-center gap-8 w-[850px] h-[140px] px-10 py-6 rounded-2xl text-sm font-medium text-muted bg-foreground/30 shadow-lg">
      {/* Type Picker */}
      <VerticalPicker options={TYPES} selected={selectedType} onChange={onTypeChange} />

      <div className="w-1 h-16 bg-foreground mx-2 rounded-full" />

      {/* Difficulty Picker */}
      <VerticalPicker
        options={DIFFICULTIES}
        selected={selectedDifficulty}
        onChange={onDifficultyChange}
      />

      <div className="w-1 h-16 bg-foreground mx-2 rounded-full" />

      {/* Length count buttons */}
      <div className="flex items-center gap-4">
        {lengthOptions.map((val) => (
          <button
            key={val}
            onClick={() => onLengthChange(val)}
            className={`px-3 py-1.5 text-4xl font-bold rounded-full transition-all duration-150 ${
              selectedLength === val
                ? "text-[hsl(50,100%,52%)]"
                : "text-muted hover:text-[hsl(50,100%,52%)]"
            }`}
          >
            {val}
          </button>
        ))}
      </div>

      {/* Session Settings Menu */}
      <div ref={settingsRef} className="absolute top-3 right-3">
        <button
          onClick={() => setSettingsOpen((v) => !v)}
          title="Session options"
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
            settingsOpen
              ? "bg-[hsl(50,100%,52%)] text-black"
              : "text-muted hover:text-[hsl(50,100%,52%)]"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* Settings dropdown */}
        {settingsOpen && (
          <div className="absolute top-0 left-full ml-3 w-56 bg-[#17150F] border border-[#2C2920] rounded-xl p-4 shadow-2xl z-50 flex flex-col gap-3">
            <p className="text-xs text-[#C8BCAD] font-semibold uppercase tracking-wider">Mode</p>
            <div className="flex gap-2">
              {(["timed", "question based"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => onModeChange(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all capitalize ${
                    selectedMode === m
                      ? "bg-[hsl(50,100%,52%)] text-black border-transparent"
                      : "border-[#2C2920] text-[#C8BCAD] hover:border-[hsl(50,100%,52%)]"
                  }`}
                >
                  {m === "timed" ? "Timed" : "Questions"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
