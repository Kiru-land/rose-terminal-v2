import { getEthPrice } from './utils/getEthPrice.js';
import { pricesKV } from '../../config.js';
import { formatEther } from 'ethers';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const { r0, r1 } = req.body;

        if (!r0 || !r1) {
            return res.status(400).json({ success: false, error: 'Missing r0 or r1 values' });
        }

        // Compute ROSE/ETH ratio using r0 and r1
        const roseEthRatio = formatEther(r0) / formatEther(r1);

        // Get the current ETH price in USD
        const ethPriceInUsd = await getEthPrice();

        // Calculate ROSE price in USD
        const rosePriceInUsd = roseEthRatio * ethPriceInUsd;

        // Generate a timestamp
        const timestamp = Date.now();

        // Create a value object containing both price and timestamp
        const priceEntry = JSON.stringify({
            price: rosePriceInUsd,
            timestamp: timestamp
        });

        // Store the entry in Vercel KV database
        await pricesKV.zadd('rose_prices', timestamp, priceEntry);

        res.status(200).json({ success: true, timestamp, rosePriceInUsd: rosePriceInUsd.toString() });
    } catch (error) {
        console.error('Error in setRosePrice:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
