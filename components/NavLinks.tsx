"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function NavLinks() {
  const pathname = usePathname()

  const linkClass = (href: string) => {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)
    return [
      "text-2xl font-bold px-5 py-2 rounded-md transition-all duration-200",
      isActive
        ? "text-[#E8C23A]"
        : "text-[#EDE6DA] hover:text-btn-background hover:bg-btn-background/[0.08]"
    ].join(" ")
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/" className={linkClass("/")}>
        Play
      </Link>
      <Link href="/attempts" className={linkClass("/attempts")}>
        History
      </Link>
      <Link href="/leaderboard" className={linkClass("/leaderboard")}>
        Leaderboard
      </Link>
    </div>
  )
}
