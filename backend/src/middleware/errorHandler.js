export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found.' });
}

// Centralised error handling. Stack traces and database details are never sent to clients.
export function errorHandler(err, req, res, _next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON request body.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large.' });
  }

  const status = err.status || err.statusCode || 500;
  if (status >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err.code || err.name);
    if (process.env.NODE_ENV !== 'production') console.error(err);
    return res.status(500).json({ message: 'Something went wrong. Please try again shortly.' });
  }
  return res.status(status).json({ message: err.message, errors: err.errors });
}
