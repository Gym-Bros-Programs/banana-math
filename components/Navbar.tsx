import Image from "next/image"
import Link from "next/link"

import AuthButton from "./AuthButton"
import NavLinks from "./NavLinks"

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between py-3 px-10 bg-[#12100A] border-b border-[#2C2920] sticky top-0 z-50">
      <div className="z-10">
        <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
          <Image
            src="/sgbanananananana.svg"
            alt="logo"
            width={40}
            height={40}
            className="rounded-lg"
            unoptimized
          />
          <span className="text-3xl font-black text-white">Banana Math</span>
        </Link>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <NavLinks />
        </div>
      </div>

      <div className="z-10 flex items-center gap-2 text-xl">
        <AuthButton />
      </div>
    </nav>
  )
}
