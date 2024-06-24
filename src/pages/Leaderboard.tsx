// pages/scores.tsx
import React, { useEffect, useState } from 'react';

interface Score {
  score: number;
  timestamp: string;
}

const ScoresPage = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setScores(data.scores);
        setLoading(false);
      })
      // eslint-disable-next-line @typescript-eslint/no-shadow
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mx-auto size-full rounded-lg bg-gray-800 p-4 px-40 shadow-md">
      <h1 className="mb-4 text-center text-xl font-semibold text-gray-600">
        Top Scores
      </h1>
      <ul className="list-none">
        {scores.map((score, index) => (
          <li
            key={index}
            className="flex items-center justify-between border-b border-gray-200 p-2"
          >
            <span className="font-medium text-gray-600">#{index + 1}</span>
            <span className="text-gray-600">
              Score: {score.score.toFixed(2)}%
            </span>
            <span className="text-sm text-gray-500">
              {new Date(score.timestamp).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScoresPage;
