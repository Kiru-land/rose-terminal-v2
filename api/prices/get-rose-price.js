import { authMiddleware } from '../middleware/auth';
import { pricesKV } from '../../config';

export default authMiddleware(async function handler(req, res) {
    console.log('Handler function called');
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

        // Check if it's a GET request
        if (req.method !== 'GET') {
            console.log('Invalid method:', req.method);
            res.status(405).json({ success: false, error: 'Method Not Allowed' });
            return;
        }

        // Retrieve all entries from the sorted set
        const entries = await pricesKV.zrange('rose_prices', 0, -1, { withScores: true });

        console.log(`Total entries fetched: ${entries.length}`);

        // Parse the entries
        const data = entries.map(([entry, score]) => {
            const { price } = JSON.parse(entry);
            return { price: Number(price), timestamp: Number(score) };
        });

        // Return the data as JSON
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error in handler:', error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
});
