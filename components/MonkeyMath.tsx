"use client"
import type { ChangeEvent, FormEvent } from "react"
import { useEffect, useRef, useState } from "react"

import ControlBar from "@/components/ControlBar"
import type { Mode, Difficulty } from "@/components/ControlBar"
import { createAttempt, addUserAnswer, finishAttempt } from "@/lib/actions/game-actions"

// Function to generate random numbers between min and max (inclusive)
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const COUNT_DOWN_TIME = 15
const RANDOM_NUMBER_MIN = 1
const RANDOM_NUMBER_MAX = 10
const OPERATORS = ["+", "-", "*", "/"] as const
type Operator = (typeof OPERATORS)[number]

export default function MonkeyMath() {
  // State variables
  const [problem, setProblem] = useState<string>("")
  const [userInput, setUserInput] = useState<string>("")
  const [, setMessage] = useState<string>("")
  const [result, setResult] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [selectedTime, setSelectedTime] = useState<number>(COUNT_DOWN_TIME)
  const [timerEnded, setTimerEnded] = useState<boolean>(false)
  const [timeLeft, setTimeLeft] = useState<number>(COUNT_DOWN_TIME)
  const [timerStarted, setTimerStarted] = useState<boolean>(false)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [selectedMode, setSelectedMode] = useState<Mode>("Arithmetic")
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("Easy")
  const inputRef = useRef(null)

  // NEW STATE: To store the ID of the current attempt session
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Function to prompt the user with a math problem
  function promptMathProblem() {
    let min = RANDOM_NUMBER_MIN
    let max = RANDOM_NUMBER_MAX
    
    if (selectedDifficulty === "Medium") max = 30
    if (selectedDifficulty === "Hard") max = 100
    if (selectedDifficulty === "Expert") { min = 10; max = 500 }

    let num1 = getRandomNumber(min, max)
    const num2 = getRandomNumber(min, max)
    const operator = OPERATORS[getRandomNumber(0, OPERATORS.length - 1)] as Operator

    if (operator === "/") {
      const multiplier = selectedDifficulty === "Easy" ? 10 : (selectedDifficulty === "Medium" ? 20 : (selectedDifficulty === "Hard" ? 50 : 100))
      num1 = num2 * getRandomNumber(1, multiplier)
    }

    // prettier-ignore
    switch (operator) {
      case "+": setResult(num1 + num2); break;
      case "-": setResult(num1 - num2); break;
      case "*": setResult(num1 * num2); break;
      case "/": setResult(num1 / num2); break;
    }

    setProblem(`${num1} ${operator} ${num2}`)
    setUserInput("")
    setMessage("")
    setIsCorrect(null)
  }

  async function checkAnswer() {
    const userAnswer = parseFloat(userInput)
    const wasCorrect = userAnswer === result

    setIsCorrect(wasCorrect)
    setTotalCount((prev) => prev + 1)

    if (wasCorrect) {
      setMessage("Correct!")
      setCorrectCount((prev) => prev + 1)
    } else {
      setMessage(`Incorrect! The correct answer is ${result}.`)
    }

    // Call the server action to log the answer
    if (attemptId) {
      await addUserAnswer({
        attemptId,
        questionId: null,
        submittedAnswer: userInput,
        isCorrect: wasCorrect
      })
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isSubmitting || !userInput) return
    setIsSubmitting(true)

    await checkAnswer()

    setTimeout(() => {
      promptMathProblem()
      setIsSubmitting(false)
    }, 300)
  }

  useEffect(() => {
    setTimeLeft(selectedTime)
  }, [selectedTime])

  // Populate the first problem on mount
  useEffect(() => {
    promptMathProblem()
  }, [])

  // MODIFIED: This effect now handles starting and finishing the attempt
  useEffect(() => {
    if (inputRef.current && timeLeft > 0) {
      ;(inputRef.current as unknown as HTMLInputElement).focus()
    }

    // When the timer starts, create a new attempt in the database
    if (timerStarted && !attemptId) {
      createAttempt()
        .then(setAttemptId)
        .catch((err) => {
          console.error("Failed to create attempt:", err)
          // Optionally, show an error message to the user
        })
    }

    let timer: NodeJS.Timeout
    if (timerStarted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    }

    // When the timer ends, finalize the attempt
    if (timeLeft === 0 && !timerEnded) {
      setTimerEnded(true)
      if (attemptId) {
        finishAttempt({ attemptId, correctCount, totalCount }).catch(console.error)
      }
    }

    return () => clearTimeout(timer)
  }, [timerStarted, timeLeft, attemptId, correctCount, totalCount, timerEnded])

  function getAnimationClass() {
    if (isCorrect === true) return "animate-flash-green"
    if (isCorrect === false) return "animate-flash-red"
    return ""
  }

  const handlePlayAgain = () => {
    promptMathProblem()
    setTimerStarted(false)
    setTimeLeft(selectedTime)
    setTimerEnded(false)
    setCorrectCount(0)
    setTotalCount(0)
    setAttemptId(null)
    setTimeout(() => {
      if (inputRef.current) {
        ;(inputRef.current as unknown as HTMLInputElement).focus()
      }
    }, 100)
  }

  const handleRestart = () => {
    promptMathProblem()
    setTimerStarted(true) // Keep it active
    setTimeLeft(selectedTime)
    setTimerEnded(false)
    setCorrectCount(0)
    setTotalCount(0)
    setAttemptId(null)
    setTimeout(() => {
      if (inputRef.current) {
        ;(inputRef.current as unknown as HTMLInputElement).focus()
      }
    }, 100)
  }

  const handleStop = () => {
    handlePlayAgain()
  }

  const percentageRight = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center w-full text-text gap-6">
      {!timerStarted || timerEnded ? (
        <ControlBar
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          selectedTime={selectedTime}
          onTimeChange={setSelectedTime}
        />
      ) : (
        <div className="relative flex items-center justify-between w-[850px] h-[140px] px-12 py-6 rounded-2xl bg-foreground/30 shadow-lg text-[#EDE6DA] font-medium">
          <div className="flex-1 flex justify-start">
            <button 
              onClick={handleRestart} 
              className="px-6 py-2 text-xl border-2 border-btn-background text-btn-background rounded-full hover:bg-btn-background/10 transition-all active:scale-95"
            >
              Restart
            </button>
          </div>
          
          <div className={`text-5xl font-bold tracking-widest text-center drop-shadow-md transition-colors duration-300 ${timeLeft <= 5 ? "text-red-500" : "text-btn-background"}`}>
            {timeLeft}
          </div>
          
          <div className="flex-1 flex justify-end">
            <button 
              onClick={handleStop} 
              className="px-6 py-2 text-xl border-2 border-red-500 text-red-500 rounded-full hover:bg-red-500/10 transition-all active:scale-95"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      <div className={`Box flex flex-col items-center justify-center w-[700px] rounded-2xl bg-foreground/30 shadow-lg ${timerEnded ? "py-12" : "h-[400px]"}`}>
        <div className="flex flex-col items-center justify-center w-full">
          {!timerEnded ? (
            <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center w-full">
              <p className="Problem text-text-active text-7xl pb-14 text-center">
                {problem}
              </p>
              <input
                ref={inputRef}
                value={userInput}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  if (!timerStarted) {
                    setTimerStarted(true)
                  }
                  setUserInput(e.target.value)
                }}
                type="number"
                className={`text-5xl flash w-60 rounded-md bg-input-box/20 p-1 mb-5 text-center text-black focus:outline-none focus:ring-4 focus:ring-border/40 ${getAnimationClass()}`}
                disabled={timerEnded}
              />
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-center gap-12 mb-10">
                <div 
                  className="w-48 h-48 rounded-full shadow-lg border-8 border-[#2C2920] relative flex items-center justify-center"
                  style={{
                    background: totalCount > 0 ? `conic-gradient(hsl(50,100%,52%) 0% ${percentageRight}%, #ef4444 ${percentageRight}% 100%)` : '#2C2920'
                  }}
                >
                  <div className="w-32 h-32 bg-[#17150F] rounded-full flex flex-col items-center justify-center shadow-inner">
                    <span className="text-3xl font-bold text-[#EDE6DA]">{percentageRight.toFixed(0)}%</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 text-left text-2xl font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md bg-[hsl(50,100%,52%)] shadow-sm" />
                    <span className="text-[#EDE6DA]">Correct: <span className="font-bold text-[hsl(50,100%,52%)]">{correctCount}</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md bg-red-500 shadow-sm" />
                    <span className="text-[#EDE6DA]">Incorrect: <span className="font-bold text-red-500">{totalCount - correctCount}</span></span>
                  </div>
                  <div className="text-muted text-lg mt-2 pt-2 border-t border-[#2C2920]">
                    Total questions: {totalCount}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handlePlayAgain}
                  className="rounded-full bg-btn-background px-10 py-4 text-2xl font-bold text-black hover:bg-btn-background-hover transition-transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
