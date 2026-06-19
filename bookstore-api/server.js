const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

// Import middleware
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");

// Import routes
const bookRoutes = require("./routes/books");

// ─────────────────────────────────────────────
// App Setup
// ─────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// Built-in & Third-party Middleware
// ─────────────────────────────────────────────
app.use(express.json());                           // parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // parse URL-encoded bodies
app.use(requestLogger);                            // log every request

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Bookstore API",
    endpoints: {
      getAllBooks:    "GET    /api/books",
      searchBooks:   "GET    /api/books?author=xyz&genre=abc&page=1&limit=10",
      getBookById:   "GET    /api/books/:id",
      addBook:       "POST   /api/books",
      updateBook:    "PUT    /api/books/:id",
      deleteBook:    "DELETE /api/books/:id",
    },
  });
});

app.use("/api/books", bookRoutes);

// ─────────────────────────────────────────────
// 404 Handler — unknown routes
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route '${req.method} ${req.originalUrl}' not found`,
  });
});

// ─────────────────────────────────────────────
// Global Error Handler (must be last)
// ─────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────
// Database Connection & Server Start
// ─────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
