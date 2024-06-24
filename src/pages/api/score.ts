// pages/api/score.ts
import type { NextApiRequest, NextApiResponse } from 'next';

import clientPromise from '../../utils/MongoDB';

interface ScoreData {
  message: string;
  result?: unknown;
  error?: unknown;
}

async function handler(req: NextApiRequest, res: NextApiResponse<ScoreData>) {
  if (req.method === 'POST') {
    const { score, timestamp } = req.body;

    if (!score || !timestamp) {
      res.status(400).json({ message: 'Score and timestamp are required.' });
      return;
    }

    try {
      const client = await clientPromise;
      const db = client.db('BananaMath');
      const collection = db.collection('scores');
      const result = await collection.insertOne({ score, timestamp });
      res.status(201).json({ message: 'Score saved successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Could not connect to database', error });
    }
  } else {
    // Handle any non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
