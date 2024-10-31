import axios from 'axios';

export default async function handler(req, res) {
  const API_KEY = process.env.API_KEY;

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await axios.post(
      `${process.env.API_BASE_URL}/api/eligible/set-address-communities`,
      {}, // Empty body as the original endpoint doesn't require any payload
      {
        headers: { 'x-api-key': API_KEY }
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error || 'An error occurred while updating address communities'
    });
  }
}