import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';

// Function to generate random numbers between min and max (inclusive)
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//const BUTTON_CLASS = 'bg-zinc-700 text-zinc-400 px-3 py-1 rounded';
const TEXT_CLASS = 'text-zinc-400 hover:text-zinc-200';
const INPUT_CLASS = 'bg-zinc-700 text-zinc-200 p-2 rounded w-1/2 text-center';
const SUBMIT_BUTTON_CLASS = 'bg-yellow-500 text-zinc-900 px-4 py-2 rounded';

export default function MonkeyMath() {
  const [problem, setProblem] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timerEnded, setTimerEnded] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(10); // Start the timer at 10 seconds
  const [timerStarted, setTimerStarted] = useState<boolean>(false);

  // Function to prompt the user with a math problem
  function promptMathProblem() {
    let num1 = getRandomNumber(1, 10);
    const num2 = getRandomNumber(1, 10);
    const operator = ['+', '-', '*', '/'][getRandomNumber(0, 3)];

    // If the operator is '/', adjust num1 and num2 to ensure the result is a whole number
    if (operator === '/') {
      num1 = num2 * getRandomNumber(1, 10);
    }

    // eslint-disable-next-line default-case
    switch (operator) {
      case '+':
        setResult(num1 + num2);
        break;
      case '-':
        setResult(num1 - num2);
        break;
      case '*':
        setResult(num1 * num2);
        break;
      case '/':
        setResult(num1 / num2);
        break;
    }

    setProblem(`${num1} ${operator} ${num2}`);
    setUserInput('');
    setMessage('');
    setIsCorrect(null);
  }

  function checkAnswer() {
    const userAnswer = parseFloat(userInput);
    if (userAnswer === result) {
      setMessage('Correct!');
      setIsCorrect(true);
    } else {
      setMessage(`Incorrect! The correct answer is ${result}.`);
      setIsCorrect(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    checkAnswer();
    setTimeout(promptMathProblem, 300); // Wait 1 second before prompting a new problem
  }

  // Populate the first problem when the component mounts
  useEffect(() => {
    promptMathProblem();
  }, []);

  // Update the timer every second once it has started
  useEffect(() => {
    if (timerStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000); // Decrease the time left every second

      // Clean up the timer when the component unmounts
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0) {
      setTimerEnded(true);
    }
  }, [timerStarted, timeLeft]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-zinc-800 p-4 text-zinc-200">
      <header className="mb-8 flex w-full items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="https://placehold.co/40x40"
            alt="logo"
            className="size-10"
          />
          <span className="text-xl font-bold">BananaMath</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className={TEXT_CLASS}>Contact</button>
          <button className={TEXT_CLASS}>Support</button>
          <button className={TEXT_CLASS}>Settings</button>
        </div>
      </header>
      <div className="flex min-h-full w-full flex-col items-center">
        <div className="mb-2 flex items-center justify-center">
          {/* Display the time left */}
          <div className="mb-6 text-center">
            {/* <p className="mb-5 text-2xl">{problem}</p> */}
            <p>{timeLeft}</p>
          </div>
        </div>
        <div className="flex min-h-full w-full max-w-3xl flex-col items-center rounded-lg bg-zinc-700/30 p-6 shadow-lg">
          {/* <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button className={BUTTON_CLASS}>Addition</button>
          <button className={BUTTON_CLASS}>Subtraction</button>
          <button className={BUTTON_CLASS}>Multiplication</button>
          <button className={BUTTON_CLASS}>Division</button>
        </div>
        <div className="flex space-x-2">
          <button className={BUTTON_CLASS}>Easy</button>
          <button className={BUTTON_CLASS}>Medium</button>
          <button className={BUTTON_CLASS}>Hard</button>
        </div>
            </div> */}
          <div className="mb-6 text-center">
            <p className="mb-5 text-2xl">{problem}</p>
          </div>
          <div className="flex justify-center">
            <form onSubmit={handleSubmit}>
              <input
                value={userInput}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  if (!timerStarted) {
                    setTimerStarted(true);
                  }
                  setUserInput(e.target.value);
                }}
                type="number"
                className={`flash mb-4 w-80 rounded-md border-0 bg-zinc-600/20 p-2 text-center focus:outline-none focus:ring-4 focus:ring-zinc-400/20 ${isCorrect === true ? 'animate-flash-green' : isCorrect === false ? 'animate-flash-red' : ''}`}
                disabled={timerEnded}
              />
              <div className="mb-6 flex space-x-10">
                <button
                  type="submit"
                  // onClick={checkAnswer}
                  className="rounded bg-zinc-600/20 px-4 py-2 font-bold text-white hover:bg-opacity-30"
                >
                  Check Answer
                </button>
                <button
                  type="button"
                  onClick={promptMathProblem}
                  className="rounded bg-zinc-600/20 px-4 py-2 font-bold text-white hover:bg-opacity-30"
                >
                  New Problem
                </button>
              </div>
            </form>
          </div>
          {/* <div className="mt-4 flex justify-center">
            <button className={SUBMIT_BUTTON_CLASS}>Submit</button>
          </div> */}
        </div>
      </div>
      <footer className="mt-8 flex w-full items-center justify-between text-sm text-zinc-400">
        <div className="flex space-x-2">
          <button>Contact</button>
          <button>Support</button>
          <button>GitHub</button>
          <button>Twitter</button>
        </div>
        <div>
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
