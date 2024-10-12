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

        // Get all keys from the KV store
        const keys = await pricesKV.keys('*');
        console.log('Fetched keys:', keys);

        // If no keys are found, return an empty object
        if (!keys || keys.length === 0) {
            console.log('No keys found in KV store');
            res.status(200).json({ success: true, data: {} });
            return;
        }

        // Fetch all values associated with the keys in a single operation
        const values = await pricesKV.mget(...keys);
        console.log('Fetched values:', values);

        // Combine keys and values into an object
        const data = Object.fromEntries(
            keys.map((key, index) => [key, Number(values[index])])
        );
        console.log('Combined data:', data);

        // Return the data as JSON
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error in handler:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
