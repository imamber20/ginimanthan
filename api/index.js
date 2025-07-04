import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Data file paths
const roomsFile = path.join(__dirname, 'data', 'rooms.json');
const bookingsFile = path.join(__dirname, 'data', 'bookings.json');

// ... (rest of the file remains the same)

// Helper functions to read and write data
// ...

// Routes
// ...

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export the app for Vercel
export default app;