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

        console.log('Raw entries:', entries); // Log raw entries for debugging

        if (!entries || entries.length === 0) {
            res.status(404).json({ success: false, error: 'No price data available' });
            return;
        }

        // Parse and format the entries
        const data = [];
        for (let i = 0; i < entries.length; i += 2) {
            const priceEntry = entries[i];
            const timestamp = parseInt(entries[i + 1]);
            
            console.log('Processing entry:', priceEntry, timestamp); // Log each entry being processed

            let parsedPrice;
            try {
                parsedPrice = JSON.parse(priceEntry);
            } catch (parseError) {
                console.error('Error parsing price entry:', parseError);
                console.log('Raw price entry:', priceEntry);
                continue; // Skip this entry if it can't be parsed
            }

            if (typeof parsedPrice === 'object' && parsedPrice !== null && 'price' in parsedPrice) {
                data.push({ price: parsedPrice.price, time: timestamp });
            } else {
                console.warn('Skipping invalid price entry:', parsedPrice);
            }
        }

        console.log('Processed data:', data); // Log processed data for debugging

        if (data.length === 0) {
            res.status(404).json({ success: false, error: 'No valid price data available' });
            return;
        }

        const candlestickData = aggregateDataToCandlesticks(data, timeframe);

        // Return the data as JSON
        res.status(200).json({ success: true, data: candlestickData });
    } catch (error) {
        console.error('Error in handler:', error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
});

function aggregateDataToCandlesticks(data, timeframe) {
    const interval = getIntervalInSeconds(timeframe);
    const candlesticks = {};

    data.forEach(({ price, time }) => {
        const candleTime = Math.floor(time / interval) * interval;
        if (!candlesticks[candleTime]) {
            candlesticks[candleTime] = { time: candleTime, open: price, high: price, low: price, close: price };
        } else {
            const candle = candlesticks[candleTime];
            candle.high = Math.max(candle.high, price);
            candle.low = Math.min(candle.low, price);
            candle.close = price;
        }
    });

    return Object.values(candlesticks);
}

function getIntervalInSeconds(timeframe) {
    const intervals = {
        '1m': 60,
        '5m': 300,
        '15m': 900,
        '30m': 1800,
        '1h': 3600,
        '4h': 14400,
        '1D': 86400,
        '3D': 259200
    };
    return intervals[timeframe];
}
