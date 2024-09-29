import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: 'Address parameter is required' });
    }

    try {
      const registeredAddresses = await kv.get('registered-addresses') || {
        aeon: [],
        sproto: [],
        spx: [],
        mog: [],
        milady: [],
        hpos: []
      };
      
      const belongingCommunities = Object.entries(registeredAddresses)
        .filter(([_, addresses]) => addresses.includes(address))
        .map(([community, _]) => community);

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