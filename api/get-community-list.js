import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  console.log('Received request:', req.method, req.url);

  // Extract the community from the URL path
  const community = req.url.split('/').pop();

  if (req.method === 'GET') {
    // Handle GET request for fetching eligible addresses per community
    try {
      console.log('Fetching registered addresses for community:', community);
      const registeredAddresses = await kv.get(community) || [];
      console.log('Registered addresses:', registeredAddresses);

      return res.status(200).json({ community, addresses: registeredAddresses });
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    console.log('Invalid method:', req.method);
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}