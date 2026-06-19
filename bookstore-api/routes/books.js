const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

// ─────────────────────────────────────────────
// GET /api/books
// Get all books with optional search & pagination
// Query params: author, genre, page, limit
// ─────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const { author, genre, page = 1, limit = 10 } = req.query;

    // Build dynamic filter object
    const filter = {};
    if (author) {
      filter.author = { $regex: author, $options: "i" }; // case-insensitive
    }
    if (genre) {
      filter.genre = { $regex: genre, $options: "i" };
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // cap at 100
    const skip = (pageNum - 1) * limitNum;

    const [books, total] = await Promise.all([
      Book.find(filter).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      Book.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      count: books.length,
      data: books,
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// GET /api/books/:id
// Get a single book by ID
// ─────────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: `Book with ID '${req.params.id}' not found`,
      });
    }

    res.status(200).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// POST /api/books
// Add a new book
// ─────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const { title, author, genre, price, publishedDate, inStock } = req.body;

    // Manual check for required fields (schema validation also runs below)
    if (!title || !author || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, author, and price are required",
      });
    }

    const book = await Book.create({
      title,
      author,
      genre,
      price,
      publishedDate,
      inStock,
    });

    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// PUT /api/books/:id
// Update an existing book by ID
// ─────────────────────────────────────────────
router.put("/:id", async (req, res, next) => {
  try {
    const { title, author, price } = req.body;

    // Validate that required fields aren't being cleared out
    if (title === "" || author === "" || price === "") {
      return res.status(400).json({
        success: false,
        error: "title, author, and price cannot be empty",
      });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,           // return updated document
        runValidators: true, // enforce schema validations on update
      }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        error: `Book with ID '${req.params.id}' not found`,
      });
    }

    res.status(200).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// DELETE /api/books/:id
// Delete a book by ID
// ─────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: `Book with ID '${req.params.id}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Book '${book.title}' deleted successfully`,
      data: book,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
