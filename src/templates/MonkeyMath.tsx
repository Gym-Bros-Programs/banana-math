import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

// Function to generate random numbers between min and max (inclusive)
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const TEXT_CLASS = 'text-zinc-400 hover:text-zinc-200';

export default function MonkeyMath() {
  const [problem, setProblem] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  // const [message, setMessage] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timerEnded, setTimerEnded] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(10); // Start the timer at 10 seconds
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [userScore, setUserScore] = useState<number>(0);
  const inputRef = useRef(null);

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
    setIsCorrect(null);
  }

  function checkAnswer() {
    const userAnswer = parseFloat(userInput);
    if (userAnswer === result) {
      setIsCorrect(true);
      setCorrectCount(correctCount + 1);
    } else {
      setIsCorrect(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    checkAnswer();
    setTotalCount(totalCount + 1);
    setTimeout(promptMathProblem, 300); // Wait 0.3 s before prompting a new problem
  }
  // Adjusted postScore function to be async and handle errors more gracefully
  const postScore = async (score: number, timestamp: Date) => {
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score, timestamp }),
      });

      if (!response.ok) {
        throw new Error('Failed to post score');
      }

      // const data = await response.json();
      // console.log(data.message); // This was used to print the response message to the console for debugging purposes
    } catch (error) {
      console.error('Error posting score:', error); // This was used to print the error to the console if there was a problem posting the score
      // Handle error (e.g., update UI to show error message)
    }
  };

  // Populate the first problem when the component mounts
  useEffect(() => {
    promptMathProblem();
  }, []);

  useEffect(() => {
    if (totalCount > 0) {
      // Prevent division by zero
      setUserScore((correctCount / totalCount) * 100);
    }
  }, [correctCount, totalCount]);

  // Update the timer every second once it has started
  useEffect(() => {
    // Focus the input field when the component mounts
    if (inputRef.current) {
      (inputRef.current as unknown as HTMLInputElement).focus();
    }

    let timer: NodeJS.Timeout | null = null;

    if (timerStarted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !timerEnded) {
      setTimerEnded(true);
      postScore(userScore, new Date()).catch((error) => {
        console.error('Failed to post score:', error.message);
        // Optionally, update the UI to inform the user that score submission failed
      });
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timerStarted, timeLeft]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-zinc-800 px-12 py-6 text-zinc-200">
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
            <p
              className="text-xl text-gray-700"
              style={{ visibility: timerStarted ? 'visible' : 'hidden' }}
            >
              {timeLeft}
            </p>
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
            <p className="mb-5 text-2xl" hidden={timerEnded}>
              {problem}
            </p>
            <p
              className="text-center text-2xl text-gray-700"
              hidden={!timerEnded}
            >
              {totalCount > 0 ? `${userScore.toFixed(2)}%` : '0%'}
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
                // eslint-disable-next-line no-nested-ternary
                className={`flash mb-4 w-80 rounded-md border-0 bg-zinc-600/20 p-2 text-center focus:outline-none focus:ring-4 focus:ring-zinc-400/20 ${isCorrect === true ? 'animate-flash-green' : isCorrect === false ? 'animate-flash-red' : ''}`}
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
                    setTimeout(() => {
                      if (inputRef.current) {
                        (
                          inputRef.current as unknown as HTMLInputElement
                        ).focus();
                      }
                    }, 0.2);
                  }}
                  style={{ visibility: timerEnded ? 'visible' : 'hidden' }}
                  className="w-1/2 rounded bg-zinc-600/20 px-4 py-2 font-bold text-white hover:bg-zinc-600/30"
                >
                  Attempt Again
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
          <span>v0.0.1</span>
        </div>
      </footer>
    </div>
  );
}
