import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ControlBar from "./ControlBar";

describe("ControlBar", () => {
  const defaultProps = {
    selectedMode: "+ − × ÷" as any,
    onModeChange: vi.fn(),
    selectedDifficulty: "Easy" as any,
    onDifficultyChange: vi.fn(),
    selectedTime: 60,
    onTimeChange: vi.fn(),
  };

  it("renders correctly with default props", () => {
    render(<ControlBar {...defaultProps} />);
    
    // Check if time buttons are rendered
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
  });

  it("calls onTimeChange when a time button is clicked", () => {
    render(<ControlBar {...defaultProps} />);
    
    const btn15 = screen.getByText("15");
    fireEvent.click(btn15);
    
    expect(defaultProps.onTimeChange).toHaveBeenCalledWith(15);
  });

  it("renders the vertical pickers with selected values", () => {
    render(<ControlBar {...defaultProps} />);
    
    // Since vertical pickers map multiple duplicated options for the carousel,
    // we can check if the text for mode and difficulty are in the document.
    const easyTexts = screen.getAllByText("Easy");
    expect(easyTexts.length).toBeGreaterThan(0);
    
    const modeTexts = screen.getAllByText("+ − × ÷");
    expect(modeTexts.length).toBeGreaterThan(0);
  });
});
