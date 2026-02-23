function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found.' });
  }
  next();
}

function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };

