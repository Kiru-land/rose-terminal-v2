import { clawbackKV } from '../../config';

/**
 * @api {get} /api/registration/check-clawback-registration Check Clawback Registration
 * @apiName CheckClawbackRegistration
 * @apiGroup Registration
 * @apiDescription Checks if a given address is registered for clawback.
 *
 * @apiParam {String} address Ethereum address to check
 *
 * @apiSuccess {Boolean} isRegistered Whether the address is registered or not
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "isRegistered": true
 *     }
 *
 * @apiError {String} error Error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Address is required"
 *     }
 */

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    try {
      const registeredAddresses = await clawbackKV.get('registered-addresses') || [];
      const isRegistered = registeredAddresses.includes(address);
      
      return res.status(200).json({ isRegistered });
    } catch (error) {
      console.error('Error checking registration:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}