import { authMiddleware } from '../auth/auth.js';
import { pricesKV } from '../../config.js';

export default authMiddleware(async function handler(req, res) {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Allow specific methods
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers

        // Handle preflight OPTIONS request
        if (req.method === 'OPTIONS') {
            console.log('CORS preflight request received');
            res.status(200).end();
            return;
        }

        console.log('Incoming request:', req.method, req.url);
        console.log('Query parameters:', req.query);

        // Check if it's a GET request
        if (req.method !== 'GET') {
            console.log('Invalid method:', req.method);
            res.status(405).json({ success: false, error: 'Method Not Allowed' });
            return;
        }

        const { timeframe } = req.query;
        const validTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1D', '3D'];
        if (!validTimeframes.includes(timeframe)) {
            res.status(400).json({ success: false, error: 'Invalid timeframe' });
            return;
        }

        // Retrieve all entries from the sorted set
        const entries = await pricesKV.zrange('rose_prices', 0, -1, { withScores: true });

        if (!entries || entries.length === 0) {
            res.status(404).json({ success: false, error: 'No price data available' });
            return;
        }

        // Parse and format the entries
        const data = [];
        for (let i = 0; i < entries.length; i += 2) {
            const priceEntry = entries[i];
            const timestamp = parseInt(entries[i + 1]);
            
            if (typeof priceEntry === 'object' && priceEntry !== null && 'price' in priceEntry) {
                data.push({ value: parseFloat(priceEntry.price), time: timestamp });
            }
        }

        if (data.length === 0) {
            res.status(404).json({ success: false, error: 'No valid price data available' });
            return;
        }

        // Sort the data by time
        data.sort((a, b) => a.time - b.time);

        // Return the data as JSON
        res.status(200).json({ success: true, data: data });
    } catch (error) {
        console.error('Error in handler:', error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
});
