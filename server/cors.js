// Only explicitly configured browser origins may read this API cross-origin.
export function cors(allowedOrigins = []) {
  const allowed = new Set(allowedOrigins);
  return (req, res, next) => {
    const origin = req.get('Origin');
    res.vary('Origin');
    if (origin && allowed.has(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (req.method === 'OPTIONS') {
      return origin && !allowed.has(origin)
        ? res.status(403).json({ error: 'This website is not allowed to access the API.' })
        : res.status(204).end();
    }
    next();
  };
}
