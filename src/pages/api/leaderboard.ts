// pages/api/leaderboard.ts
import type { NextApiRequest, NextApiResponse } from 'next';

import clientPromise from '../../utils/MongoDB';

interface LeaderboardData {
  message: string;
  scores?: Array<{ score: number; timestamp: string }>;
  error?: unknown;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeaderboardData>,
) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('BananaMath');
      const collection = db.collection('scores');
      // Fetch the top 10 scores, sorted by score in descending order
      const scores = (
        await collection.find({}).sort({ score: -1 }).limit(10).toArray()
      ).map(({ score, timestamp }) => ({ score, timestamp }));
      res
        .status(200)
        .json({ message: 'Top 10 scores fetched successfully', scores });
    } catch (error) {
      res.status(500).json({ message: 'Could not connect to database', error });
    }
  } else {
    // Handle any non-GET requests
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
