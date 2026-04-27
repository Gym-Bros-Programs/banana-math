"use client"
import React from "react"

export type Mode = "Arithmetic" | "Geometry" | "Algebra" | "Trigonometry"
export type Difficulty = "Easy" | "Medium" | "Hard" | "Expert"

type ControlBarProps = {
  selectedMode: Mode
  onModeChange: (mode: Mode) => void
  selectedDifficulty: Difficulty
  onDifficultyChange: (difficulty: Difficulty) => void
  selectedTime: number
  onTimeChange: (time: number) => void
}

function VerticalPicker<T extends string>({ 
  options, 
  selected, 
  onChange,
  disabled = false,
  onDisabledClick
}: { 
  options: T[], 
  selected: T, 
  onChange: (val: T) => void,
  disabled?: boolean,
  onDisabledClick?: () => void
}) {
  const currentIndex = options.indexOf(selected)
  const middleOffset = 50 * options.length
  const [virtualIndex, setVirtualIndex] = React.useState(middleOffset + currentIndex)

  React.useEffect(() => {
    const currentMod = ((virtualIndex % options.length) + options.length) % options.length
    if (currentMod !== currentIndex) {
      setVirtualIndex(middleOffset + currentIndex)
    }
  }, [currentIndex, options.length, middleOffset, virtualIndex])
  
  const handleUp = () => {
    if (disabled) {
      if (onDisabledClick) onDisabledClick()
      return
    }
    setVirtualIndex(v => v - 1)
    const prevIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1
    onChange(options[prevIndex])
  }

  const handleDown = () => {
    if (disabled) {
      if (onDisabledClick) onDisabledClick()
      return
    }
    setVirtualIndex(v => v + 1)
    const nextIndex = currentIndex === options.length - 1 ? 0 : currentIndex + 1
    onChange(options[nextIndex])
  }

  const repeatedOptions = React.useMemo(() => Array(100).fill(options).flat(), [options])

  return (
    <div className="flex flex-col items-center justify-center w-40">
      <button onClick={handleUp} className={`text-muted p-1 transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "hover:text-btn-background"}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
      </button>
      <div className="relative h-8 w-full overflow-hidden my-1">
        <div 
          className="absolute w-full flex flex-col transition-transform duration-300 ease-in-out"
          style={{ transform: `translateY(-${virtualIndex * 32}px)` }}
        >
          {repeatedOptions.map((option, i) => (
            <div 
              key={i} 
              className="h-8 flex items-center justify-center text-[hsl(50,100%,52%)] text-2xl font-medium w-full text-center truncate select-none"
            >
              {option}
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleDown} className={`text-muted p-1 transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "hover:text-btn-background"}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </div>
  )
}

export default function ControlBar({
  selectedMode,
  onModeChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedTime,
  onTimeChange
}: ControlBarProps) {
  const modes: Mode[] = ["Arithmetic", "Geometry", "Algebra", "Trigonometry"]
  const difficulties: Difficulty[] = ["Easy", "Medium", "Hard", "Expert"]
  const times = [15, 30, 60, 120]

  const [toast, setToast] = React.useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="relative flex items-center justify-center gap-8 w-[850px] h-[140px] px-10 py-6 rounded-2xl text-sm font-medium text-muted bg-foreground/30 shadow-lg">
      
      {/* Toast */}
      {toast && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#17150F] text-[hsl(50,100%,52%)] font-semibold border border-[hsl(50,100%,52%)] px-6 py-3 rounded-md shadow-lg whitespace-nowrap z-50 transition-all">
          {toast}
        </div>
      )}

      {/* Mode Picker */}
      <VerticalPicker 
        options={modes} 
        selected={selectedMode} 
        onChange={onModeChange} 
        disabled={true}
        onDisabledClick={() => showToast("Other question types are not ready yet!")}
      />

      {/* Divider */}
      <div className="w-1 h-16 bg-foreground mx-2 rounded-full" />

      {/* Difficulty Picker */}
      <VerticalPicker options={difficulties} selected={selectedDifficulty} onChange={onDifficultyChange} />

      {/* Divider */}
      <div className="w-1 h-16 bg-foreground mx-2 rounded-full" />

      {/* Time buttons */}
      <div className="flex items-center gap-4">
        {times.map((time) => (
          <button
            key={time}
            onClick={() => onTimeChange(time)}
            className={`px-3 py-1.5 text-3xl rounded-full transition-all duration-150 ${
              selectedTime === time ? "text-[hsl(50,100%,52%)]" : "hover:text-[hsl(50,100%,52%)]"
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
