import { authMiddleware } from '../auth/auth.js';
import { clawbackKV } from '../../config.js';

/**
 * @api {get} /api/registration/clawback-registrations Get Registered Addresses for Clawback
 * @apiName GetClawbackRegistrations
 * @apiGroup Registration
 * @apiDescription Retrieves all registered Ethereum addresses for clawback.
 *
 * @apiSuccess {Object} response Response object
 * @apiSuccess {String[]} response.addresses List of registered addresses
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "addresses": ["0x123...", "0x456..."]
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

export default authMiddleware(async function handler(req, res) {
  console.log('Received request:', req.method);

  if (req.method === 'GET') {
    try {
      console.log('Fetching registered addresses');
      const registeredAddresses = await clawbackKV.get('registered-addresses') || [];

      console.log('Found registered addresses:', registeredAddresses);
      return res.status(200).json({ addresses: registeredAddresses });
    } catch (error) {
      console.error('Error fetching registered addresses:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    console.log('Invalid method:', req.method);
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
});