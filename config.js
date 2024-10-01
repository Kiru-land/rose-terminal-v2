import { Redis } from '@upstash/redis';

// Initialize KV databases with custom configurations
const clawbackKV = new Redis({
  url: process.env.KV_PRICES_REST_API_URL,
  token: process.env.KV_PRICES_REST_API_TOKEN,
});

const pricesKV = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Create a config object with the Redis instances
const config = {
  clawbackKV,
  pricesKV,
};

// Export the configuration and Redis instances
export default config;