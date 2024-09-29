import fs from 'fs/promises';
import path from 'path';
import { kv } from '@vercel/kv';

const communities = ['aeon', 'sproto', 'spx', 'mog', 'milady', 'hpos'];

async function uploadEligibleAddresses() {
  const basePath = path.join(process.cwd(), 'public', 'eligibility-lists');

  for (const community of communities) {
    const filePath = path.join(basePath, `${community}.txt`);
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const addresses = fileContent
        .split('\n')
        .map(line => line.split(',')[0].trim())
        .filter(address => address && address.startsWith('0x'));

      // Use a separate key for each community
      const key = `eligible-addresses-${community}`;
      await kv.set(key, JSON.stringify(addresses));
      console.log(`Eligible addresses for ${community} uploaded successfully`);
    } catch (error) {
      console.error(`Error processing ${community}:`, error);
    }
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await uploadEligibleAddresses();
      res.status(200).json({ message: 'Eligible addresses updated successfully' });
    } catch (error) {
      console.error('Error updating eligible addresses:', error);
      res.status(500).json({ error: 'Failed to update eligible addresses' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
