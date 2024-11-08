import axios from 'axios';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

export default async function handler(req, res) {
  console.log('=== CORS Debug Info ===');
  console.log('Configured ALLOWED_ORIGIN:', ALLOWED_ORIGIN);
  console.log('Incoming request origin:', req.headers.origin);
  console.log('All request headers:', req.headers);

  // CORS check
  if (!ALLOWED_ORIGIN) {
    console.error('❌ ALLOWED_ORIGIN environment variable is not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const origin = req.headers.origin;
  if (origin !== ALLOWED_ORIGIN) {
    console.error('❌ Origin mismatch:', {
      receivedOrigin: origin,
      allowedOrigin: ALLOWED_ORIGIN,
      matches: origin === ALLOWED_ORIGIN,
      typeof_received: typeof origin,
      typeof_allowed: typeof ALLOWED_ORIGIN
    });
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  console.log('✅ Origin check passed');

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('👉 Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  const API_KEY = process.env.API_KEY;

  if (req.method !== 'POST') {
    console.error('❌ Invalid method:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  console.log('📝 Request body:', req.body);

  try {
    console.log('🔄 Making request to API:', `${process.env.API_BASE_URL}/api/prices/set-rose-price`);
    const response = await axios.post(`${process.env.API_BASE_URL}/api/prices/set-rose-price`, req.body, {
      headers: { 
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ API response:', response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('❌ Proxy error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    res.status(error.response?.status || 500).json({ error: 'An error occurred while setting price data' });
  }
}