/**
 * MonkeyMath component for generating math problems and checking user answers.
 *
 * @returns The MonkeyMath component.
 */
"use client";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import addAttempt from "@/app/server-actions/addAttempt";

// Function to generate random numbers between min and max (inclusive)
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const TEXT_CLASS = "text-zinc-400 hover:text-zinc-200";

export default function MonkeyMath() {
  // State variables
  const [problem, setProblem] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timerEnded, setTimerEnded] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(10); // Start the timer at 10 seconds
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const inputRef = useRef(null);

  // Function to prompt the user with a math problem
  function promptMathProblem() {
    let num1 = getRandomNumber(1, 10);
    const num2 = getRandomNumber(1, 10);
    const operator = ["+", "-", "*", "/"][getRandomNumber(0, 3)];

    // If the operator is '/', adjust num1 and num2 to ensure the result is a whole number
    if (operator === "/") {
      num1 = num2 * getRandomNumber(1, 10);
    }

    // Calculate the result based on the operator
    switch (operator) {
      case "+":
        setResult(num1 + num2);
        break;
      case "-":
        setResult(num1 - num2);
        break;
      case "*":
        setResult(num1 * num2);
        break;
      case "/":
        setResult(num1 / num2);
        break;
    }

    // Set the problem and reset user input, message, and correctness status
    setProblem(`${num1} ${operator} ${num2}`);
    setUserInput("");
    setMessage("");
    setIsCorrect(null);
  }

  // Function to check the user's answer
  function checkAnswer() {
    const userAnswer = parseFloat(userInput);
    if (userAnswer === result) {
      setMessage("Correct!");
      setIsCorrect(true);
      setCorrectCount(correctCount + 1);
      setTotalCount(totalCount + 1);
    } else {
      setMessage(`Incorrect! The correct answer is ${result}.`);
      setIsCorrect(false);
      setTotalCount(totalCount + 1);
    }
  }

  // Function to handle form submission
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    checkAnswer();
    setTimeout(promptMathProblem, 300); // Wait 0.3 s before prompting a new problem
  }

  // Populate the first problem when the component mounts
  useEffect(() => {
    promptMathProblem();
  }, []);

  // Update the timer every second once it has started
  useEffect(() => {
    // Focus the input field when the component mounts
    if (inputRef.current) {
      (inputRef.current as unknown as HTMLInputElement).focus();
    }

    // Start the countdown timer
    if (timerStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000); // Decrease the time left every second

      // Clean up the timer when the component unmounts
      return () => clearTimeout(timer);
    }

    // End the timer when timeLeft reaches 0
    if (timeLeft === 0) {
      setTimerEnded(true);
      addAttempt(correctCount, totalCount);
    }
  }, [timerStarted, timeLeft]);

  return (
    <div className="flex flex-grow w-full flex-col justify-center items-center text-zinc-200">
      <div className="mb-2 flex items-center justify-center">
        {/* Display the time left */}
        <div className="mb-6 text-center">
          {/* <p className="mb-5 text-2xl">{problem}</p> */}
          <p
            className="text-xl text-gray-700"
            style={{ visibility: timerStarted ? "visible" : "hidden" }}
          >
            {timeLeft}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center w-1/2 rounded-lg bg-zinc-700/30 p-6 shadow-lg">
        <div className="mb-6 text-center">
          <p className="mb-5 text-2xl" hidden={timerEnded}>
            {problem}
          </p>
          <p
            className="text-center text-2xl text-gray-700"
            hidden={!timerEnded}
          >
            {totalCount > 0
              ? `${((correctCount / totalCount) * 100).toFixed(2)}%`
              : "0%"}
          </p>
        </div>
        <div className="flex justify-center">
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={userInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (!timerStarted) {
                  setTimerStarted(true);
                }
                setUserInput(e.target.value);
              }}
              type="number"
              className={`flash mb-4 w-80 rounded-md border-0 bg-zinc-600/20 p-2 text-center focus:outline-none focus:ring-4 focus:ring-zinc-400/20 ${isCorrect === true ? "animate-flash-green" : isCorrect === false ? "animate-flash-red" : ""}`}
              disabled={timerEnded}
            />

            <div className="mb-6 flex justify-center space-x-10">
              <button
                type="button"
                onClick={() => {
                  promptMathProblem();
                  setTimerStarted(false);
                  setTimeLeft(10); // Reset the timer to 10 seconds
                  setTimerEnded(false);
                  setCorrectCount(0);
                  setTotalCount(0);
                  setTimeout(() => {
                    if (inputRef.current) {
                      (
                        inputRef.current as unknown as HTMLInputElement
                      ).focus();
                    }
                  }, 0.2);
                }}
                style={{ visibility: timerEnded ? "visible" : "hidden" }}
                className="w-1/2 rounded bg-zinc-600/20 px-4 py-2 font-bold text-white hover:bg-opacity-30"
              >
                Attempt Again
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
