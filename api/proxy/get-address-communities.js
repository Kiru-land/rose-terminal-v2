import axios from 'axios';

export default async function handler(req, res) {
  const API_KEY = process.env.API_KEY;
  const { address } = req.query;
  console.log(`[proxy] Received request for address: ${address}`);

  if (!address) {
    console.log('[proxy] No address provided');
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    console.log(`[proxy] Making request to: ${process.env.API_BASE_URL}/api/eligible/get-address-communities`);
    const response = await axios.get(`${process.env.API_BASE_URL}/api/eligible/get-address-communities`, {
      params: { address },
      headers: { 'x-api-key': API_KEY }
    });
    console.log(`[proxy] Received response for ${address}:`, response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('[proxy] Error:', error.response?.data || error.message);
    console.error('[proxy] Full error object:', error);
    res.status(error.response?.status || 500).json({ error: 'An error occurred while fetching data' });
  }
}