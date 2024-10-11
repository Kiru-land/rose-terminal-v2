import { pricesKV } from '../../config';

export default async function handler(req, res) {
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

        // Retrieve the list of prices
        const dataList = await pricesKV.lrange('rosePrices', 0, -1);

        // If no data is found, return an empty array
        if (!dataList || dataList.length === 0) {
            console.log('No data found in KV store');
            res.status(200).json({ success: true, data: [] });
            return;
        }

        // Parse each data entry
        const data = dataList.map(item => JSON.parse(item));

        console.log('Retrieved data:', data);

        // Return the data as JSON
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching KV contents:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
