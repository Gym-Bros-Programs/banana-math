import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

import ControlBar from "./ControlBar"

describe("ControlBar Component", () => {
  const mockProps = {
    selectedType: "+ − × ÷" as const,
    onTypeChange: vi.fn(),
    selectedDifficulty: "Easy" as any,
    onDifficultyChange: vi.fn(),
    selectedLength: 15,
    onLengthChange: vi.fn(),
    selectedMode: "timed" as const,
    onModeChange: vi.fn()
  }

  it("renders correctly with initial props", () => {
    render(<ControlBar {...mockProps} />)
    expect(screen.getAllByText("+ − × ÷").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Easy").length).toBeGreaterThan(0)
    expect(screen.getByText("15")).toHaveClass("text-[hsl(50,100%,52%)]")
  })

  it("calls onTimeChange when a time option is clicked", () => {
    render(<ControlBar {...mockProps} />)
    fireEvent.click(screen.getByText("30"))
    expect(mockProps.onLengthChange).toHaveBeenCalledWith(30)
  })

  it("shows the settings menu when the gear icon is clicked", () => {
    render(<ControlBar {...mockProps} />)
    const gearButton = screen.getByTitle("Session options")
    fireEvent.click(gearButton)
    expect(screen.getByText("Mode")).toBeInTheDocument()
    expect(screen.getByText("Timed")).toBeInTheDocument()
    expect(screen.getByText("Questions")).toBeInTheDocument()
  })

  it("calls onSessionModeChange when switching modes in settings", () => {
    render(<ControlBar {...mockProps} />)
    fireEvent.click(screen.getByTitle("Session options"))
    fireEvent.click(screen.getByText("Questions"))
    expect(mockProps.onModeChange).toHaveBeenCalledWith("question based")
  })
})
