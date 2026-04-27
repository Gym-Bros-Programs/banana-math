import { Suspense } from "react"
import MonkeyMath from "@/components/MonkeyMath"

export default function Index() {
  return (
    <div className="flex flex-1 w-full flex-col items-center justify-center">
      <Suspense fallback={<div className="text-[#C8BCAD] font-bold tracking-widest uppercase">Loading Game...</div>}>
        <MonkeyMath />
      </Suspense>
    </div>
  )
}
