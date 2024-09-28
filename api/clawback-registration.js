import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { address, community } = req.body;

    if (!address || !community) {
      return res.status(400).json({ error: 'Address and community are required' });
    }

    try {
      // Get the current list of registered addresses for the community
      let registeredAddresses = await kv.get(community) || [];

      // Check if the address is already registered
      if (registeredAddresses.includes(address)) {
        return res.status(409).json({ error: 'Address already registered' });
      }

      // Add the new address to the list
      registeredAddresses.push(address);

      // Update the database
      await kv.set(community, registeredAddresses);

      return res.status(200).json({ message: 'Address registered successfully' });
    } catch (error) {
      console.error('Error registering address:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
