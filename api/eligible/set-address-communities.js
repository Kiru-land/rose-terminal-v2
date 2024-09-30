import fs from 'fs/promises';
import path from 'path';
import { kv } from '@vercel/kv';

const communities = ['aeon', 'sproto', 'spx', 'mog', 'milady', 'hpos'];

async function uploadAddressCommunities() {
  const basePath = path.join(process.cwd(), 'public', 'eligibility-lists');
  const addressCommunities = new Map();

  for (const community of communities) {
    const filePath = path.join(basePath, `${community}.txt`);
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const addresses = fileContent
        .split('\n')
        .map(line => line.split(',')[0].trim())
        .filter(address => address && address.startsWith('0x'));

      console.log(`Processing ${community}: ${addresses.length} addresses found`);

      for (const address of addresses) {
        if (addressCommunities.has(address)) {
          addressCommunities.get(address).add(community);
        } else {
          addressCommunities.set(address, new Set([community]));
        }
      }
    } catch (error) {
      console.error(`Error processing ${community}:`, error);
    }
  }

  console.log(`Total unique addresses: ${addressCommunities.size}`);

  // Upload address-community mappings to KV store
  for (const [address, communities] of addressCommunities) {
    const key = `${address}`;
    const value = JSON.stringify(Array.from(communities));

    try {
      await kv.set(key, value);
      console.log(`Uploaded communities for address ${address}: ${value}`);
    } catch (error) {
      console.error(`Error uploading data for address ${address}:`, error);
    }
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
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
