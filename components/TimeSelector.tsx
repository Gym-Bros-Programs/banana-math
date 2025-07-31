// components/TimerSelector.tsx
type TimerSelectorProps = {
  options: number[]
  selected: number
  onSelect: (time: number) => void
}

export default function TimerSelector({ options, selected, onSelect }: TimerSelectorProps) {
  return (
    <div className="mb-4 flex justify-center space-x-4">
      {options.map((time) => (
        <button
          key={time}
          onClick={() => onSelect(time)}
          className={`px-4 py-2 rounded-full text-2xl transition-all duration-150 ${
            selected === time
              ? "bg-zinc-300 text-black font-semibold"
              : "bg-zinc-600/30 text-white hover:bg-zinc-400/30"
          }`}
        >
          {time}s
        </button>
      ))}
    </div>
  )
}
