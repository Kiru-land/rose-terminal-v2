import axios from 'axios';

const ALLOWED_IP = process.env.ALLOWED_IP;

export default async function handler(req, res) {
  console.log('=== Request Debug Info ===');
  
  // Get the client's IP address
  const clientIP = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                  req.socket.remoteAddress;
  
  console.log('Debug Info:', {
    allowedIP: ALLOWED_IP,
    clientIP: clientIP,
    headers: req.headers,
    forwardedFor: req.headers['x-forwarded-for']
  });

  // IP check
  if (!ALLOWED_IP) {
    console.error('❌ ALLOWED_IP environment variable is not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (clientIP !== ALLOWED_IP) {
    console.error('❌ IP mismatch:', {
      receivedIP: clientIP,
      allowedIP: ALLOWED_IP,
      matches: clientIP === ALLOWED_IP
    });
    return res.status(403).json({ error: 'IP not allowed' });
  }

  console.log('✅ IP check passed');

  const API_KEY = process.env.API_KEY;

  if (req.method !== 'POST') {
    console.error('❌ Invalid method:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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