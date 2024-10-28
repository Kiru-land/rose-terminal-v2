import { ethers } from 'ethers';
import { Pool } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import { uniswapV3PoolAbi } from './uniswapV3PoolAbi.js';

// In Create React App, environment variables must be prefixed with REACT_APP_
const ETH_MAINNET_URL = process.env.REACT_APP_ETH_MAINNET_URL;
const poolAddress = process.env.REACT_APP_UNISWAP_V3_USDC_WETH_POOL_ADDRESS;

if (!ETH_MAINNET_URL) {
    console.error('REACT_APP_ETH_MAINNET_URL is not set in the .env file');
    // Don't exit process in browser environment
    throw new Error('Missing ETH_MAINNET_URL environment variable');
}

const provider = new ethers.JsonRpcProvider(ETH_MAINNET_URL);

export async function getEthPrice() {
    const poolContract = new ethers.Contract(poolAddress, uniswapV3PoolAbi, provider);

    try {
        // Fetch necessary data from the pool
        const [slot0, fee, liquidity, token0Address, token1Address] = await Promise.all([
            poolContract.slot0(),
            poolContract.fee(),
            poolContract.liquidity(),
            poolContract.token0(),
            poolContract.token1(),
        ]);

        const sqrtPriceX96 = slot0.sqrtPriceX96;
        const tick = slot0.tick;

        // Convert variables to the correct types
        const feeAmount = Number(fee); // Convert fee (bigint) to number
        const liquidityAmount = liquidity.toString(); // Convert liquidity to string
        const sqrtPriceX96Str = sqrtPriceX96.toString(); // Convert sqrtPriceX96 to string
        const tickNumber = Number(tick); // Convert tick (bigint) to number

        // Create token instances
        const USDC = new Token(1, token0Address, 6, 'USDC', 'USD Coin');
        const WETH = new Token(1, token1Address, 18, 'WETH', 'Wrapped Ether');

        // Create a pool instance using the fetched data
        const pool = new Pool(
            USDC,
            WETH,
            feeAmount,
            sqrtPriceX96Str,
            liquidityAmount,
            tickNumber
        );

        // Get the price of WETH in terms of USDC
        const ethPriceInUsd = parseFloat(pool.token1Price.toSignificant(6));

        return ethPriceInUsd;
    } catch (error) {
        console.error('Error fetching ETH price:', error);
        throw error;
    }
}
