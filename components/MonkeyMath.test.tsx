import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import MonkeyMath from "./MonkeyMath"
import * as gameActions from "@/lib/actions/game-actions"

// Mock the game actions
vi.mock("@/lib/actions/game-actions", () => ({
  getQuestionsForSession: vi.fn(),
  createSession: vi.fn(),
  saveSessionAnswers: vi.fn()
}))

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams()
}))

describe("MonkeyMath Component", () => {
  const mockQuestions = [
    {
      id: "1",
      question_text: "2 + 2",
      correct_answer: "4",
      category: "arithmetic",
      sub_type: "addition"
    },
    {
      id: "2",
      question_text: "5 - 3",
      correct_answer: "2",
      category: "arithmetic",
      sub_type: "subtraction"
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(gameActions.getQuestionsForSession as any).mockResolvedValue(mockQuestions)
    ;(gameActions.createSession as any).mockResolvedValue("mock-session-id")

    // Mock localStorage
    const localStorageMock = (function () {
      let store: any = {}
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString()
        },
        clear: () => {
          store = {}
        }
      }
    })()
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
  })

  it("renders the settings screen initially", () => {
    render(<MonkeyMath />)
    expect(screen.getByText("Start")).toBeInTheDocument()
  })

  it("loads questions when Start is clicked", async () => {
    render(<MonkeyMath />)
    const startButton = screen.getByText("Start")

    await act(async () => {
      fireEvent.click(startButton)
    })

    await waitFor(() => {
      expect(gameActions.getQuestionsForSession).toHaveBeenCalled()
    })
  })

  it("prefetches questions without showing them before Start", async () => {
    render(<MonkeyMath />)

    await waitFor(() => {
      expect(gameActions.getQuestionsForSession).toHaveBeenCalledTimes(1)
    })

    expect(screen.queryByText("2 + 2")).not.toBeInTheDocument()
  })

  it("starts from prefetched questions without an extra fetch and refills the cache", async () => {
    render(<MonkeyMath />)

    await waitFor(() => {
      expect(gameActions.getQuestionsForSession).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      fireEvent.click(screen.getByText("Start"))
    })

    await waitFor(() => {
      expect(gameActions.getQuestionsForSession).toHaveBeenCalledTimes(2)
    })
  })
})
