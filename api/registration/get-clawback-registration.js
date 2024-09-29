import { kv } from '@vercel/kv';

/**
 * @api {get} /api/registration/get-clawback-registration Get Clawback Registrations
 * @apiName GetClawbackRegistrations
 * @apiGroup Registration
 * @apiDescription Retrieves all registered addresses for clawback across all communities.
 *
 * @apiSuccess {Object} registeredAddresses Object containing lists of registered addresses for each community
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "aeon": ["0x1234...", "0x5678..."],
 *       "sproto": ["0xabcd...", "0xefgh..."],
 *       ...
 *     }
 *
 * @apiError {String} error Error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Internal server error",
 *       "details": "Error message details"
 *     }
 */

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const registeredAddresses = await kv.get('registered-addresses') || {
        aeon: [],
        sproto: [],
        spx: [],
        mog: [],
        milady: [],
        hpos: []
      };
      
      return res.status(200).json(registeredAddresses);
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
