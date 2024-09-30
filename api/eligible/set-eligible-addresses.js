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

      console.log(`Processing ${community}: ${addresses.length} addresses found`);

      if (addresses.length === 0) {
        console.warn(`No valid addresses found for ${community}`);
        continue;
      }

      // Use a separate key for each community
      const key = `eligible-addresses-${community}`;
      const stringifiedAddresses = JSON.stringify(addresses);
      
      console.log(`Stringified addresses for ${community} (first 100 chars): ${stringifiedAddresses.slice(0, 100)}...`);

      await kv.set(key, stringifiedAddresses);
      
      // Verify the upload
      const storedAddresses = await kv.get(key);
      console.log(`Stored addresses for ${community} (first 100 chars): ${JSON.stringify(storedAddresses).slice(0, 100)}...`);

      if (JSON.stringify(storedAddresses) !== stringifiedAddresses) {
        console.warn(`Mismatch in stored data for ${community}`);
      }

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
