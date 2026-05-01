import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000"

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Banana Math",
  description: "The fastest way to learn mental math",
  icons: {
    icon: [{ url: "/sgbanananananana.svg", type: "image/svg+xml" }],
    shortcut: "/sgbanananananana.svg",
    apple: "/sgbanananananana.svg"
  }
}

import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-text-active`}>
        <div className="min-h-screen flex flex-col w-full">
          <Navbar />
          <main className="flex-1 w-full flex flex-col px-10">{children}</main>
          <div className="w-full py-3 border-t border-[#2C2920] mt-auto bg-[#17150F]">
            <Footer />
          </div>
        </div>
      </body>
    </html>
  )
}
