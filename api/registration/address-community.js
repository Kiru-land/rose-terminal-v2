import { kv } from '@vercel/kv';

/**
 * @api {get} /api/registration/address-community Get Communities for Address
 * @apiName GetAddressCommunities
 * @apiGroup Registration
 * @apiDescription Retrieves all communities an address belongs to.
 *
 * @apiParam {String} address Ethereum address to check
 *
 * @apiSuccess {String} address The checked Ethereum address
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
      const registeredAddresses = await kv.get('registered-addresses') || {
        aeon: [],
        sproto: [],
        spx: [],
        mog: [],
        milady: [],
        hpos: []
      };
      
      const belongingCommunities = Object.entries(registeredAddresses)
        .filter(([_, addresses]) => addresses.includes(address))
        .map(([community, _]) => community);

      return res.status(200).json({ address, communities: belongingCommunities });
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}