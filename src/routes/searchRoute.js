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

export default router;
