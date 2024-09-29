import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  console.log('Received request:', req.method, req.url);

  if (req.method === 'GET') {
    try {
      const registeredAddresses = await kv.get('registered-addresses') || {
        aeon: [],
        sproto: [],
        spx: [],
        mog: [],
        milady: [],
        hpos: []
      };
      const communities = Object.keys(registeredAddresses);
      console.log('All communities:', communities);
      return res.status(200).json({ communities });
    } catch (error) {
      console.error('Error listing communities:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    console.log('Invalid method:', req.method);
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}