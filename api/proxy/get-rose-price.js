import axios from 'axios';

export default async function handler(req, res) {
  const API_KEY = process.env.API_KEY;
  const { timeframe } = req.query;

  try {
    const response = await axios.get(`${process.env.API_BASE_URL}/api/prices/get-rose-price`, {
      headers: { 'x-api-key': API_KEY },
      params: { timeframe }
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'An error occurred while fetching price data' });
  }
}
