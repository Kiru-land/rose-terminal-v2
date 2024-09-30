import fs from 'fs/promises';
import path from 'path';
import { kv } from '@vercel/kv';

const communities = ['aeon', 'sproto', 'spx', 'mog', 'milady', 'hpos'];

async function setAddressCommunities() {
  const basePath = path.join(process.cwd(), 'public', 'eligibility-lists');
  const batchSize = 1000;

  for (const community of communities) {
    const filePath = path.join(basePath, `${community}.txt`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const addresses = fileContent.split('\n').map(line => line.trim()).filter(address => address && address.startsWith('0x'));

    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      const pipeline = kv.pipeline();
      batch.forEach(address => pipeline.sadd(`${address}`, community));
      await pipeline.exec();
    }
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await setAddressCommunities();
      res.status(200).json({ message: 'Address-community mappings updated successfully' });
    } catch (error) {
      console.error('Error updating address-community mappings:', error);
      res.status(500).json({ error: `Failed to update address-community mappings: ${error.message}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
