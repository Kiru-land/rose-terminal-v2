import fs from 'fs/promises';
import path from 'path';
import { authMiddleware } from '../auth/auth.js';
import { clawbackKV } from '../../config';

/**
 * @api {post} /api/eligible/set-address-communities Set Address Communities
 * @apiName SetAddressCommunities
 * @apiGroup Eligibility
 * @apiDescription Updates the communities associated with Ethereum addresses based on eligibility lists.
 *
 * @apiSuccess {Number} totalAddresses The total number of unique addresses processed
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "totalAddresses": 1000,
 *       "message": "Successfully updated address communities"
 *     }
 *
 * @apiError {String} error Error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Failed to update address communities"
 *     }
 */


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

  // Use pipeline for batch operations
  const pipeline = clawbackKV.pipeline();

  // Prepare batch operations
  for (const [address, communities] of addressCommunities) {
    const key = `${address}`;
    const value = Array.from(communities).join(',');  // Change this line
    pipeline.set(key, value);
  }

  // Execute batch operations
  try {
    await pipeline.exec();
    console.log(`Uploaded communities for ${addressCommunities.size} addresses`);
  } catch (error) {
    console.error('Error uploading data:', error);
    throw error; // Rethrow the error to be caught by the handler
  }
}

export default authMiddleware(async function handler(req, res) {
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
}) // Add this closing parenthesis
