import express from 'express';
import cloudinary from '../lib/cloudinary.js';
import Book from '../models/Book.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protectRoute, async (req, res) => {
    try {
        const { title, caption, image, rating } = req.body;

        if (!image || !title || !caption || !rating) return res.status(400).json({ message: 'Please provide all fields!' });

        // upload image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;
        
        // save to the database
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id,
        });

        await newBook.save();
        res.status(201).json({ message: 'Book created successfully!', book: newBook });

    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Pagination => infinite loading
router.get('/', protectRoute, async (req, res) => {
    try {
        const { page = 1, limit = 5 } = req.query;
        const skip = (page - 1) * limit;

        const books = await Book.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('user', 'username profileImage'); // Populate user details

        const totalBooks = await Book.countDocuments();
        res.send({
            books,
            currentPage: parseInt(page),
            totalBooks,
            totalPages: Math.ceil(await Book.countDocuments() / limit)
        })
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/user', protectRoute, async (req, res) => {
    try {
        const userId = req.user._id;

        const books = await Book.find({ user: userId })
            .sort({ createdAt: -1 });

        res.status(200).json(books);
    } catch (error) {
        console.error('Error fetching user books:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.delete('/:id', protectRoute, async (req, res) => {
    try {
        const bookId = req.params.id;

        // Find the book
        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: 'Book not found!' });

        // Check if the user is the owner of the book
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this book!' });
        }
        
        // Delete the book's image from cloudinary
        if (book.image && book.image.includes('cloudinary')) {
            try {
                const publicId = book.image.split('/').pop().split('.')[0]; // Extract public ID from URL
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.error('Error deleting image from Cloudinary:', deleteError);
                // return res.status(500).json({ message: 'Failed to delete image from Cloudinary', error: deleteError.message });
            }
        }

        // Delete the book
        await book.deleteOne();

        res.status(200).json({ message: 'Book deleted successfully!' });

    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;

