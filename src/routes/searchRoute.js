import express from "express";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/suggestion", protectRoute, async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) return res.status(400).json({ message: "Query is required!" });
        
        // Search books by title (case insensitive, partial match)
        const books = await Book.find({
            title: { $regex: query, $options: "i" }
        })
        .limit(10)
        .select("title");

        res.json(books);

    } catch (error) {
        console.error("Error fetching search suggestion: ", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET /api/books/search?query=xyz&page=1&limit=5
router.get("/", protectRoute, async (req, res) => {
    try {
        const { query, page = 1, limit = 5 } = req.query;
        const skip = (page - 1) * limit;

        if (!query) {
            return res.status(400).json({ message: "Query is required!" });
        }

        // Search in both title & caption for better results
        const searchCondition = {
            $or: [
                { title: { $regex: new RegExp(query, "i") } },
                { caption: { $regex: new RegExp(query, "i") } }
            ]
        };

        const books = await Book.find(searchCondition)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate("user", "username profileImage"); // populate username & profileImage

        const totalBooks = await Book.countDocuments(searchCondition);

        res.send({
            books,
            currentPage: parseInt(page),
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit)
        });

    } catch (error) {
        console.error("Error searching books:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;
