/**
 * Global Error Handler Middleware
 * Catches all errors forwarded via next(err) and returns a clean JSON response.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      details: messages,
    });
  }

  // Mongoose bad ObjectId (CastError)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
  }

  // Duplicate key (e.g. unique index violation)
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: "Duplicate field value entered",
    });
  }

  // Default server error
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
