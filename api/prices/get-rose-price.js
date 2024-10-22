import { authMiddleware } from '../auth/auth.js';
import { pricesKV } from '../../config.js';

export default authMiddleware(async function handler(req, res) {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Allow specific methods
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers

        // Handle preflight OPTIONS request
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        // Ensure it's a GET request
        if (req.method !== 'GET') {
            return res.status(405).json({ success: false, error: 'Method Not Allowed' });
        }

        console.log('Fetching rose prices from KV store');
        const entries = await pricesKV.zrange('rose_prices', 0, -1, { withScores: true });
        console.log('Fetched entries:', entries);

        if (!entries || entries.length === 0) {
            console.log('No price data available');
            return res.status(404).json({ success: false, error: 'No price data available' });
        }

        const priceMap = new Map();

        for (let i = 0; i < entries.length; i += 2) {
            const member = entries[i];
            const score = entries[i + 1];

            console.log('Processing entry:', { member, score });

            try {
                let parsedMember;

                if (typeof member === 'string') {
                    if (member.startsWith('{') && member.endsWith('}')) {
                        parsedMember = JSON.parse(member);
                    } else {
                        console.error('Member is not valid JSON:', member);
                        continue;
                    }
                } else if (typeof member === 'object') {
                    parsedMember = member;
                } else {
                    console.error('Member is of unknown type:', typeof member, 'Member:', member);
                    continue;
                }

                const { price, timestamp } = parsedMember;

                if (priceMap.has(timestamp)) {
                    const existingPrice = priceMap.get(timestamp);
                    const averagePrice = (existingPrice + price) / 2;
                    priceMap.set(timestamp, averagePrice);
                } else {
                    priceMap.set(timestamp, price);
                }
            } catch (parseError) {
                console.error('Error parsing member:', parseError, 'Member:', member);
            }
        }

        const data = Array.from(priceMap, ([timestamp, price]) => ({ timestamp, price }));

        console.log('Processed data:', data);

        if (data.length === 0) {
            console.log('No valid price data available');
            return res.status(404).json({ success: false, error: 'No valid price data available' });
        }

        data.sort((a, b) => a.timestamp - b.timestamp);
        console.log('Sorted data:', data);

        // Add this new log statement
        console.log('Final data being sent:', JSON.stringify({ success: true, data }, null, 2));

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error in get-rose-price:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
