import { authMiddleware } from '../auth/auth';
import { clawbackKV } from '../../config';

/**
 * @api {post} /api/registration/clawback-registration Register Address for Clawback
 * @apiName ClawbackRegistration
 * @apiGroup Registration
 * @apiDescription Registers an Ethereum address for clawback.
 *
 * @apiParam {String} address Ethereum address to register
 *
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Address registered successfully"
 *     }
 *
 * @apiError {String} error Error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Address is required"
 *     }
 * 
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 409 Conflict
 *     {
 *       "error": "Address already registered"
 *     }
 * 
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Internal server error",
 *       "details": "Error message details"
 *     }
 */

export default authMiddleware(async function handler(req, res) {
  console.log('Received request:', req.method, req.body);

  if (req.method === 'POST') {
    const { address } = req.body;

    console.log('Received address:', address);

    if (!address) {
      console.log('Error: Missing address');
      return res.status(400).json({ error: 'Address is required' });
    }

    try {
      console.log('Fetching registered addresses');
      let registeredAddresses = await clawbackKV.get('registered-addresses') || [];

      // Check if the address is already registered
      if (registeredAddresses.includes(address)) {
        console.log('Address already registered');
        return res.status(409).json({ error: 'Address already registered' });
      }

      console.log('Adding new address to the list');
      registeredAddresses.push(address);

      console.log('Updating database');
      await clawbackKV.set('registered-addresses', registeredAddresses);

      console.log('Registration successful');
      return res.status(200).json({ message: 'Address registered successfully' });
    } catch (error) {
      console.error('Error registering address:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    console.log('Invalid method:', req.method);
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
});
