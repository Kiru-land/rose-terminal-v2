import { kv } from '@vercel/kv';

// Initialize KV databases
const clawbackKV = kv({
  url: process.env.KV_PRICES_REST_API_URL,
  token: process.env.KV_PRICES_REST_API_TOKEN,
});

const pricesKV = kv({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Create a config object with the KV instances
const config = {
  clawbackKV,
  pricesKV,
};

// Export the configuration and KV instances
export default config;