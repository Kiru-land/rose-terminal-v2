import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  console.log('Received request:', req.method, req.url);

  if (req.method === 'GET') {
    try {
      const keys = await kv.keys('*');
      console.log('All keys:', keys);
      return res.status(200).json({ keys });
    } catch (error) {
      console.error('Error listing keys:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    console.log('Invalid method:', req.method);
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}