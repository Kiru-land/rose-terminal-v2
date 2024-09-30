import fs from 'fs/promises';
import path from 'path';
import { kv } from '@vercel/kv';

const allCommunities = ['aeon', 'sproto', 'spx', 'mog', 'milady', 'hpos'];

async function uploadAddressCommunities(communities) {
  const basePath = path.join(process.cwd(), 'public', 'eligibility-lists');
  const batchSize = 1000; // Adjust this value based on your needs

  for (const community of communities) {
    const filePath = path.join(basePath, `${community}.txt`);
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const addresses = fileContent
        .split('\n')
        .map(line => line.split(',')[0].trim())
        .filter(address => address && address.startsWith('0x'));

      console.log(`Processing ${community}: ${addresses.length} addresses found`);

      // Process addresses in batches
      for (let i = 0; i < addresses.length; i += batchSize) {
        const batch = addresses.slice(i, i + batchSize);
        const pipeline = kv.pipeline();

        for (const address of batch) {
          pipeline.sadd(`${address}`, community);
        }

        await pipeline.exec();
        console.log(`Processed batch ${i / batchSize + 1} for ${community}`);
      }

      console.log(`Finished processing ${community}`);
    } catch (error) {
      console.error(`Error processing ${community}:`, error);
    }
  }

  console.log('All communities processed');
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // No need to destructure communities from req.body
      await uploadAddressCommunities();
      res.status(200).json({ message: 'Address-community mappings updated successfully' });
    } catch (error) {
      console.error('Error updating address-community mappings:', error);
      res.status(500).json({ error: 'Failed to update address-community mappings' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
