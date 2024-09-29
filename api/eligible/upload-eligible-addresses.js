import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { kv } from '@vercel/kv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadEligibleAddresses() {
  const communities = ['aeon', 'sproto', 'spx', 'mog', 'milady', 'hpos'];
  const eligibleAddresses = {};

  for (const community of communities) {
    const filePath = path.join(__dirname, '..', '..', 'public', 'eligibility-lists', `${community}.txt`);
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const addresses = fileContent
        .split('\n')
        .map(line => line.split(',')[0].trim())
        .filter(address => address && address.startsWith('0x'));
      eligibleAddresses[community] = addresses;
    } catch (error) {
      console.error(`Error reading file for ${community}:`, error);
      eligibleAddresses[community] = [];
    }
  }

  try {
    await kv.set('eligible-addresses', JSON.stringify(eligibleAddresses));
    console.log('Eligible addresses uploaded successfully');
  } catch (error) {
    console.error('Error uploading eligible addresses:', error);
  }
}

uploadEligibleAddresses();
