import { Redis } from '@upstash/redis';

// Initialize KV databases with custom configurations
export const clawbackKV = new Redis({
  url: process.env.KV_PRICES_REST_API_URL,
  token: process.env.KV_PRICES_REST_API_TOKEN,
});

export const pricesKV = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});