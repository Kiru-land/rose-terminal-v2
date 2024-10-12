import { pricesKV } from '../../config';

export default async function handler(req, res) {
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

        let cursor = '0';
        let keys = [];
        let data = {};

        // Use SCAN to iterate over keys
        do {
            const result = await pricesKV.scan(cursor, { count: 100 });
            cursor = result.cursor;
            keys = keys.concat(result.keys);

            // Fetch values for this batch of keys
            if (result.keys.length > 0) {
                const values = await pricesKV.mget(...result.keys);
                result.keys.forEach((key, index) => {
                    data[key] = Number(values[index]);
                });
            }
        } while (cursor !== '0');

        console.log('Fetched data:', data);

        // Return the data as JSON
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error in handler:', error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
}
