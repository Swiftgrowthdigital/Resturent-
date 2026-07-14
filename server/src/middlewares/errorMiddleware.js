function notFound(_req, res) {
  res.status(404).json({ message: 'Route not found' });
}

function errorHandler(err, req, res, _next) {
  const status = err.statusCode || (err.code === 11000 ? 409 : 500);
  if (status >= 500) {
    console.error('[API error]', {
      method: req.method,
      path: req.originalUrl,
      status,
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
  }
  res.status(status).json({
    message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Server error' : (err.message || 'Server error')
  });
}

module.exports = { notFound, errorHandler };
