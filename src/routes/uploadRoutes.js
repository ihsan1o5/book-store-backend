import express from 'express';
import protectRoute from '../middleware/auth.middleware.js';
import { getSignedUploadParams } from '../lib/cloudinary.js';

const router = express.Router();

// GET /api/upload-signature?folder=books/pdfs
router.get('/', protectRoute, (req, res) => {
  try {
    const { folder } = req.query;
    if (!folder) {
      return res.status(400).json({ message: 'Folder is required in query string' });
    }

    const uploadParams = getSignedUploadParams(folder);
    res.status(200).json(uploadParams);
  } catch (err) {
    console.error('Error generating signature:', err);
    res.status(500).json({ message: 'Failed to generate upload signature', error: err.message });
  }
});

export default router;
