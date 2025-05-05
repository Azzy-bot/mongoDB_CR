import { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { searchTerm } = req.query;

  if (!searchTerm || typeof searchTerm !== 'string') {
    return res.status(400).json({ message: 'Search term is required' });
  }

  try {
    await client.connect();
    const db = client.db();
    const results = await db
      .collection('fixtures')
      .find({
        $or: [
          { home_team: { $regex: searchTerm, $options: 'i' } },
          { away_team: { $regex: searchTerm, $options: 'i' } }
        ]
      })
      .limit(10)
      .toArray();

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching fixtures:', error);
    return res.status(500).json({ message: 'Error searching fixtures' });
  }
} 