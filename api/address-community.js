import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: 'Address parameter is required' });
    }

    try {
      // Get all keys (communities) from the database
      const keys = await kv.keys('*');
      
      // Array to store communities the address belongs to
      const belongingCommunities = [];

      // Check each community for the address
      for (const community of keys) {
        const addresses = await kv.get(community);
        if (addresses && addresses.includes(address)) {
          belongingCommunities.push(community);
        }
      }

      return res.status(200).json({ address, communities: belongingCommunities });
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}