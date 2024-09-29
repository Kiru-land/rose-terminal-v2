import { kv } from '@vercel/kv';

const communities = ['aeon', 'sproto', 'spx', 'mog', 'milady', 'hpos'];

/**
 * @api {get} /api/eligible/get-address-communities Get Communities for Address
 * @apiName GetAddressCommunities
 * @apiGroup Eligibility
 * @apiDescription Retrieves all communities an address is eligible for.
 *
 * @apiParam {String} address Ethereum address to check
 *
 * @apiSuccess {String} address The checked Ethereum address
 * @apiSuccess {String[]} communities List of communities the address is eligible for
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
 *       "error": "Address parameter is required"
 *     }
 */

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: 'Address parameter is required' });
    }

    try {
      const eligibleCommunities = [];

      for (const community of communities) {
        const key = `eligible-addresses-${community}`;
        const communityAddresses = await kv.get(key);
        
        if (communityAddresses) {
          const parsedAddresses = JSON.parse(communityAddresses);
          if (parsedAddresses.includes(address.toLowerCase())) {
            eligibleCommunities.push(community);
          }
        }
      }

      if (eligibleCommunities.length === 0) {
        return res.status(404).json({ error: `Address ${address} not found in any community` });
      }

      res.status(200).json({ address, communities: eligibleCommunities });
    } catch (error) {
      console.error('Error fetching communities for address:', error);
      res.status(500).json({ error: 'Failed to fetch communities for address' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
