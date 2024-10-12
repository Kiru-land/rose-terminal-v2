import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { Pool } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';

dotenv.config();

const ETH_MAINNET_RPC_URL = process.env.ETH_MAINNET_RPC_URL;

if (!ETH_MAINNET_RPC_URL) {
    console.error('ETH_MAINNET_RPC_URL is not set in the .env file');
    process.exit(1);
}

console.log('Using RPC URL:', ETH_MAINNET_RPC_URL);

const provider = new ethers.JsonRpcProvider(ETH_MAINNET_RPC_URL);

// Uniswap V3 USDC/WETH Pool Address (USDC is token0, WETH is token1)
const UNISWAP_V3_USDC_WETH_POOL_ADDRESS = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640';

// Uniswap V3 Pool ABI
const UNISWAP_V3_POOL_ABI = [
    "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
    "function fee() view returns (uint24)",
    "function liquidity() view returns (uint128)",
    "function token0() view returns (address)",
    "function token1() view returns (address)"
];

export async function getEthPrice() {
    const poolContract = new ethers.Contract(UNISWAP_V3_USDC_WETH_POOL_ADDRESS, UNISWAP_V3_POOL_ABI, provider);

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