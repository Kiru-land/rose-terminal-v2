import axios from 'axios';

export default async function handler(req, res) {
  const API_KEY = process.env.API_KEY;
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    const response = await axios.get(`${process.env.API_BASE_URL}/api/eligible/get-address-communities`, {
      params: { address },
      headers: { 'x-api-key': API_KEY }
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'An error occurred while fetching data' });
  }
}