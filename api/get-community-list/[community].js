import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { params = [] } = req.query;
  console.log('Received request:', req.method, req.url, params);

  // Handle GET /api/get-community-list/[community]
  if (req.method === 'GET' && params[0] === 'get-community-list' && params[1]) {
    const community = params[1].split('?')[0]; // Remove any query string
    try {
      console.log('Fetching registered addresses for community:', community);
      const registeredAddresses = await kv.get(community);
      console.log('Registered addresses:', registeredAddresses);
      
      if (registeredAddresses === null) {
        return res.status(404).json({ error: 'Community not found' });
      }
      
      return res.status(200).json({ community, addresses: registeredAddresses || [] });
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  // If no matching route is found
  res.status(404).json({ error: 'Not Found' });
}