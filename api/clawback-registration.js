import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  console.log('Received request:', req.method, req.body);

  if (req.method === 'POST') {
    const { address, community } = req.body;

    console.log('Received address:', address);
    console.log('Received community:', community);

    if (!address || !community) {
      console.log('Error: Missing address or community');
      return res.status(400).json({ error: 'Address and community are required' });
    }

    try {
      console.log('Fetching registered addresses for community:', community);
      let registeredAddresses = await kv.get(community) || [];
      console.log('Current registered addresses:', registeredAddresses);

      if (registeredAddresses.includes(address)) {
        console.log('Address already registered for this community');
        return res.status(409).json({ error: 'Address already registered' });
      }

      console.log('Adding new address to the list');
      registeredAddresses.push(address);

      console.log('Updating database');
      await kv.set(community, registeredAddresses);

      console.log('Registration successful');
      return res.status(200).json({ message: 'Address registered successfully' });
    } catch (error) {
      console.error('Error registering address:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    console.log('Invalid method:', req.method);
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
