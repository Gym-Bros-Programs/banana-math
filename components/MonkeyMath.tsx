"use client"
import type { ChangeEvent, FormEvent } from "react"
import { useEffect, useRef, useState } from "react"

import { createAttempt, addUserAnswer, finishAttempt } from "@/lib/actions/game-actions"
import { COUNT_DOWN_TIME, RANDOM_NUMBER_MIN, RANDOM_NUMBER_MAX, OPERATORS, type Operator } from "@/lib/constants/game"

// Function to generate random numbers between min and max (inclusive)
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function MonkeyMath() {
  // State variables
  const [problem, setProblem] = useState<string>("")
  const [userInput, setUserInput] = useState<string>("")
  const [, setMessage] = useState<string>("")
  const [result, setResult] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [timerEnded, setTimerEnded] = useState<boolean>(false)
  const [timeLeft, setTimeLeft] = useState<number>(COUNT_DOWN_TIME)
  const [timerStarted, setTimerStarted] = useState<boolean>(false)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [totalCount, setTotalCount] = useState<number>(0)
  const inputRef = useRef(null)

  // NEW STATE: To store the ID of the current attempt session
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Function to prompt the user with a math problem
  function promptMathProblem() {
    let num1 = getRandomNumber(RANDOM_NUMBER_MIN, RANDOM_NUMBER_MAX)
    const num2 = getRandomNumber(RANDOM_NUMBER_MIN, RANDOM_NUMBER_MAX)
    const operator = OPERATORS[getRandomNumber(0, OPERATORS.length - 1)] as Operator

    if (operator === "/") {
      num1 = num2 * getRandomNumber(1, 10)
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

  const handleAttemptAgain = () => {
    promptMathProblem()
    setTimerStarted(false)
    setTimeLeft(COUNT_DOWN_TIME)
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

  return (
    <div className="flex flex-grow w-full flex-col justify-center items-center text-zinc-200">
      <div className="mb-4 flex items-center justify-center text-center">
        <p
          className="timer-display text-4xl text-gray-400"
          style={{ visibility: timerStarted ? "visible" : "hidden" }}
        >
          {timeLeft}
        </p>
      </div>

      <div className="Box flex flex-col items-center justify-center h-[400px] w-[700px] rounded-lg bg-zinc-700/30 shadow-lg">
        <div className="flex justify-center">
          <form onSubmit={handleSubmit}>
            <p className="Problem text-7xl pb-14 text-center" hidden={timerEnded}>
              {problem}
            </p>
            <input
              hidden={timerEnded}
              ref={inputRef}
              value={userInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (!timerStarted) {
                  setTimerStarted(true)
                }
                setUserInput(e.target.value)
              }}
              type="number"
              className={`text-5xl flash w-60 rounded-md border-0 bg-zinc-600/20 p-1 mb-5 text-center focus:outline-none focus:ring-4 focus:ring-zinc-400/20 ${getAnimationClass()}`}
              disabled={timerEnded}
            />

            <p className="text-center text-4xl white pb-8" hidden={!timerEnded}>
              Correct: {correctCount} out of {totalCount}
            </p>
            <p className="text-center text-4xl white pb-8" hidden={!timerEnded}>
              Incorrect : {totalCount - correctCount} out of {totalCount}
            </p>
            <div className="flex justify-center space-x-10">
              <button
                type="button"
                onClick={handleAttemptAgain}
                hidden={!timerEnded}
                className="rounded bg-zinc-600/20 px-6 py-4 text-4xl text-white hover:bg-opacity-30"
              >
                Attempt Again
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
