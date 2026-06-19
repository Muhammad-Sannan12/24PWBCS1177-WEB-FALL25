/**
 * Request Logger Middleware
 * Logs the HTTP method, endpoint, and timestamp for every incoming request.
 */
const requestLogger = (req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}]  ${req.method}  ${req.originalUrl}`);
  next();
};

module.exports = requestLogger;
