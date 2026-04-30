import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { BackButton } from "./BackButton"

// Mock next/navigation
const mockBack = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack
  })
}))

describe("BackButton", () => {
  it("renders correctly", () => {
    render(<BackButton />)
    expect(screen.getByText("Back")).toBeInTheDocument()
  })

  it("calls router.back() when clicked", () => {
    render(<BackButton />)
    const button = screen.getByText("Back")
    fireEvent.click(button)
    expect(mockBack).toHaveBeenCalledTimes(1)
  })
})
