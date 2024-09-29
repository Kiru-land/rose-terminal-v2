import fs from 'fs/promises';
import path from 'path';
import { kv } from '@vercel/kv';

/**
 * @api {post} /api/eligible/upload-eligible-addresses Upload Eligible Addresses
 * @apiName UploadEligibleAddresses
 * @apiGroup Eligibility
 * @apiDescription Uploads eligible addresses for all communities from text files to the database.
 * 
 * @apiSuccess {String} message Success message
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Eligible addresses updated successfully"
 *     }
 * 
 * @apiError {String} error Error message
 * 
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Failed to update eligible addresses"
 *     }
 */

async function uploadEligibleAddresses() {
  const communities = ['aeon', 'sproto', 'spx', 'mog', 'milady', 'hpos'];
  const eligibleAddresses = {};
  const basePath = '../../public/eligibility-lists';

  for (const community of communities) {
    const filePath = path.join(basePath, `${community}.txt`);
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
