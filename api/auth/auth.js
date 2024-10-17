const API_KEY = process.env.API_KEY;

export function validateApiKey(req) {
  const apiKey = req.headers['x-api-key'];
  return apiKey === API_KEY;
}

export function authMiddleware(handler) {
  return async (req, res) => {
    if (!validateApiKey(req)) {
      return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }
    return handler(req, res);
  };
}
