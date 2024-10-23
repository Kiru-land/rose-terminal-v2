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

        // Parse timeframe from query parameters
        const timeframe = req.query.timeframe || '1h'; // Default to '1h' if not provided
        console.log('Timeframe requested:', timeframe);

        // Determine the sampling interval based on the timeframe
        let interval;
        switch (timeframe) {
            case '1h':
                interval = 5 * 60; // Sample every 5 minutes
                break;
            case '4h':
                interval = 20 * 60; // Sample every 20 minutes
                break;
            case '1d':
                interval = 60 * 60; // Sample every 1 hour
                break;
            case '1w':
                interval = 6 * 60 * 60; // Sample every 6 hours
                break;
            default:
                interval = 5 * 60; // Default to every 5 minutes
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

        // Process entries, parse JSON, and remove duplicates
        const dataPointsMap = new Map();

        // Since we're using zrange with "withScores", entries are in the form [member1, score1, member2, score2, ...]
        for (let i = 0; i < entries.length; i += 2) {
            const member = entries[i];
            try {
                // member is expected to be a JSON string
                const parsedMember = JSON.parse(member);
                const { price, timestamp } = parsedMember;

                // Ensure timestamp is a number
                const time = Number(timestamp);
                if (isNaN(time)) {
                    console.error('Invalid timestamp:', timestamp);
                    continue;
                }

                // Remove duplicates by keeping the latest data point for each timestamp
                dataPointsMap.set(time, { time, value: price });
            } catch (parseError) {
                console.error('Error parsing member:', parseError, 'Member:', member);
            }
        }

        // Convert Map to Array and sort by time
        const dataPoints = Array.from(dataPointsMap.values());
        dataPoints.sort((a, b) => a.time - b.time);

        if (dataPoints.length === 0) {
            console.log('No valid price data available after parsing');
            return res.status(404).json({ success: false, error: 'No valid price data available' });
        }

        // Implement timeframe-based sampling
        const sampledData = [];
        let lastSampleTime = dataPoints[0].time - (dataPoints[0].time % interval);

        for (const point of dataPoints) {
            // If the current point's time is greater than or equal to the next scheduled sample time
            if (point.time >= lastSampleTime + interval) {
                sampledData.push(point);
                // Update lastSampleTime to the time of the sampled point (aligned to interval)
                lastSampleTime = point.time - (point.time % interval);
            }
        }

        // Add the first data point if sampledData is empty
        if (sampledData.length === 0 && dataPoints.length > 0) {
            sampledData.push(dataPoints[0]);
        }

        console.log('Sampled data:', sampledData);

        if (sampledData.length === 0) {
            console.log('No data available after sampling');
            return res.status(404).json({ success: false, error: 'No data available after sampling' });
        }

        // Send response
        res.status(200).json({ success: true, data: sampledData });
    } catch (error) {
        console.error('Error in get-rose-price:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
