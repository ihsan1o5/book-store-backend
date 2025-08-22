import express from 'express';
import cors from 'cors';
import "dotenv/config";
import job from './lib/cron.js';

// Lib 
import { connectDB } from './lib/db.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

job.start(); // Start the cron job
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/upload-signature", uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port (${PORT})`);
  connectDB(); 
});



