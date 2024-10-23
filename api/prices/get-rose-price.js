import { authMiddleware } from '../auth/auth.js';
import { pricesKV } from '../../config.js';

export default authMiddleware(async function handler(req, res) {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // Handle preflight OPTIONS request
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        // Ensure it's a GET request
        if (req.method !== 'GET') {
            return res.status(405).json({ success: false, error: 'Method Not Allowed' });
        }

        // Parse timeframe from query parameters
        const timeframe = req.query.timeframe || '1h';
        console.log('Timeframe requested:', timeframe);

        // Determine the downsampling interval based on the timeframe
        let interval;
        switch (timeframe) {
            case '1h':
                interval = 5 * 60;
                break;
            case '4h':
                interval = 20 * 60;
                break;
            case '1d':
                interval = 60 * 60;
                break;
            case '1w':
                interval = 6 * 60 * 60;
                break;
            default:
                interval = 5 * 60;
                break;
        }

        // Fetch all entries from KV store
        console.log('Fetching rose prices from KV store');
        const entries = await pricesKV.zrange('rose_prices', 0, -1, { withScores: true });
        console.log('Fetched entries:', entries);

        if (!entries || entries.length === 0) {
            console.log('No price data available');
            return res.status(404).json({ success: false, error: 'No price data available' });
        }

        // Process and parse entries with duplicate removal
        const dataPointsMap = new Map();

        for (let i = 0; i < entries.length; i += 2) {
            const member = entries[i];
            try {
                const parsedMember = JSON.parse(member);
                const { price, timestamp } = parsedMember;

                // Check if timestamp already exists
                if (dataPointsMap.has(timestamp)) {
                    // Decide how to handle duplicates:
                    // Option 1: Keep the latest entry (overwrite)
                    dataPointsMap.set(timestamp, { time: timestamp, value: price });

                    // Option 2: Keep the earliest entry (do nothing)
                    // Option 3: Average the prices (compute average)
                    // For simplicity, we'll use Option 1 (overwrite with latest)
                } else {
                    dataPointsMap.set(timestamp, { time: timestamp, value: price });
                }
            } catch (parseError) {
                console.error('Error parsing member:', parseError, 'Member:', member);
            }
        }

        // Convert Map to Array
        let dataPoints = Array.from(dataPointsMap.values());

        // Sort data by timestamp
        dataPoints.sort((a, b) => a.time - b.time);

        // Downsample data
        const downsampledData = [];
        let bucketStartTime = Math.floor(dataPoints[0].time / interval) * interval;
        let sumPrice = 0;
        let count = 0;

        dataPoints.forEach((point) => {
            if (point.time < bucketStartTime + interval) {
                sumPrice += point.value;
                count += 1;
            } else {
                // Push average price for the bucket
                downsampledData.push({
                    time: bucketStartTime,
                    value: sumPrice / count,
                });
                // Reset for next bucket
                bucketStartTime = Math.floor(point.time / interval) * interval;
                sumPrice = point.value;
                count = 1;
            }
        });

        // Add the last bucket
        if (count > 0) {
            downsampledData.push({
                time: bucketStartTime,
                value: sumPrice / count,
            });
        }

        console.log('Downsampled data:', downsampledData);

        if (downsampledData.length === 0) {
            console.log('No valid price data available');
            return res.status(404).json({ success: false, error: 'No valid price data available' });
        }

        // Send response
        res.status(200).json({ success: true, data: downsampledData });
    } catch (error) {
        console.error('Error in get-rose-price:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});