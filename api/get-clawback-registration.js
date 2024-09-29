import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get all keys (communities) from the database
      const keys = await kv.keys('*');
      
      // Object to store all community data
      const allCommunityData = {};

      // Fetch data for each community
      for (const community of keys) {
        const addresses = await kv.get(community);
        allCommunityData[community] = addresses;
      }

      return res.status(200).json(allCommunityData);
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
