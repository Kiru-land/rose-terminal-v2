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

        // Get timeframe from query parameters
        const timeframe = req.query.timeframe || '1h'; // Default to 1h if not specified
        
        // Define sampling intervals (in milliseconds)
        const samplingIntervals = {
            '1h': 5 * 60 * 1000,    // 5 minutes
            '4h': 15 * 60 * 1000,   // 15 minutes
            '1d': 1 * 60 * 60 * 1000, // 1 hour
            '1w': 6 * 60 * 60 * 1000  // 6 hours
        };

        const interval = samplingIntervals[timeframe];
        if (!interval) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid timeframe. Use 1h, 4h, 1d, or 1w' 
            });
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

        // Downsample the data based on timeframe
        const downsampledData = [];
        if (data.length > 0) {
            let currentBucket = Math.floor(data[0].timestamp / interval) * interval;
            let bucketPrices = [];

            for (const point of data) {
                const pointBucket = Math.floor(point.timestamp / interval) * interval;
                
                if (pointBucket === currentBucket) {
                    bucketPrices.push(point.price);
                } else {
                    if (bucketPrices.length > 0) {
                        // Calculate average price for the bucket
                        const avgPrice = bucketPrices.reduce((a, b) => a + b, 0) / bucketPrices.length;
                        downsampledData.push({
                            timestamp: currentBucket,
                            price: avgPrice
                        });
                    }
                    currentBucket = pointBucket;
                    bucketPrices = [point.price];
                }
            }

            // Don't forget the last bucket
            if (bucketPrices.length > 0) {
                const avgPrice = bucketPrices.reduce((a, b) => a + b, 0) / bucketPrices.length;
                downsampledData.push({
                    timestamp: currentBucket,
                    price: avgPrice
                });
            }
        }

        console.log('Downsampled data:', JSON.stringify(downsampledData, null, 2));

        res.status(200).json({ success: true, data: downsampledData });
    } catch (error) {
        console.error('Error in get-rose-price:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
