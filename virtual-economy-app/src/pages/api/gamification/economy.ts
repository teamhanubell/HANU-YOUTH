import { NextApiRequest, NextApiResponse } from 'next';

const coinPacks = [
  { id: '1', amount: 100, cost: { coins: 0, gems: 5 } },
  { id: '2', amount: 500, cost: { coins: 0, gems: 20 } },
  { id: '3', amount: 1000, cost: { coins: 0, gems: 35 } },
  { id: '4', amount: 5000, cost: { coins: 0, gems: 150 } },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({ coinPacks });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}