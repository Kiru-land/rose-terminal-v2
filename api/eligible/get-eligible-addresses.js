import { kv } from '@vercel/kv';

/**
 * @api {get} /api/eligible/get-eligible-addresses Get Eligible Addresses
 * @apiName GetEligibleAddresses
 * @apiGroup Eligibility
 * @apiDescription Retrieves eligible addresses for a specific community.
 *
 * @apiParam {String} community Name of the community
 *
 * @apiSuccess {String[]} addresses List of eligible addresses for the community
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "addresses": ["0x1234...", "0x5678..."]
 *     }
 *
 * @apiError {String} error Error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Community parameter is required"
 *     }
 */

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { community } = req.query;

    if (!community) {
      return res.status(400).json({ error: 'Community parameter is required' });
    }

    try {
      const eligibleAddresses = await kv.get('eligible-addresses');
      
      if (!eligibleAddresses) {
        return res.status(404).json({ error: 'Eligible addresses not found in the database' });
      }

      const parsedAddresses = JSON.parse(eligibleAddresses);

      if (!parsedAddresses[community]) {
        return res.status(404).json({ error: `No addresses found for community: ${community}` });
      }

      res.status(200).json({ addresses: parsedAddresses[community] });
    } catch (error) {
      console.error('Error fetching eligible addresses:', error);
      res.status(500).json({ error: 'Failed to fetch eligible addresses' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
