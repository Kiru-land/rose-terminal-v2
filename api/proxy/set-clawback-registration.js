import axios from 'axios';

// Get single allowed origin from environment variable
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

export default async function handler(req, res) {
  // CORS check
  if (!ALLOWED_ORIGIN) {
    console.error('ALLOWED_ORIGIN environment variable is not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const origin = req.headers.origin;
  if (origin !== ALLOWED_ORIGIN) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = process.env.API_KEY;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await axios.post(`${process.env.API_BASE_URL}/api/registration/set-clawback-registration`, req.body, {
      headers: { 'x-api-key': API_KEY }
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'An error occurred while registering' });
  }
}