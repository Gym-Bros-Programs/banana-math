import { Suspense } from "react"

import MonkeyMath from "@/components/MonkeyMath"
import { createClient } from "@/lib/supabase/server"

export default async function Index() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  const isGuest = !user

  return (
    <div className="flex flex-1 w-full flex-col items-center justify-center">
      <Suspense
        fallback={
          <div className="text-[#C8BCAD] font-bold tracking-widest uppercase">Loading Game...</div>
        }
      >
        <MonkeyMath isGuest={isGuest} />
      </Suspense>
    </div>
  )
}
