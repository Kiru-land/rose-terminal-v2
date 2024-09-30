import { kv } from '@vercel/kv';

/**
 * @api {get} /api/eligible/get-address-communities Get Address Communities
 * @apiName GetAddressCommunities
 * @apiGroup Eligibility
 * @apiDescription Retrieves the communities associated with a specific Ethereum address.
 *
 * @apiParam {String} address Ethereum address to check
 *
 * @apiSuccess {String} address The Ethereum address queried
 * @apiSuccess {String[]} communities List of communities the address belongs to
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "address": "0x1234...",
 *       "communities": ["aeon", "sproto"]
 *     }
 *
 * @apiError {String} error Error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid address provided"
 *     }
 */


export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { address } = req.query;

    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({ error: 'Invalid address provided' });
    }

    try {
      const communitiesString = await kv.get(address);
      const communities = communitiesString ? communitiesString.split(',') : [];
      res.status(200).json({ address, communities });
    } catch (error) {
      console.error('Error fetching address communities:', error);
      res.status(500).json({ error: `Failed to fetch address communities: ${error.message}` });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
