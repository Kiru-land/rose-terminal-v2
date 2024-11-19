import axios from 'axios';

export default async function handler(req, res) {
  const API_KEY = process.env.API_KEY;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await axios.get(`${process.env.API_BASE_URL}/api/registration/get-all-registered-addresses`, {
      headers: { 'x-api-key': API_KEY }
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'An error occurred while fetching registrations' });
  }
}