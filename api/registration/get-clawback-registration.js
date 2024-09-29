import { kv } from '@vercel/kv';

export default async function handler(req, res) {
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
      
      return res.status(200).json(registeredAddresses);
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
