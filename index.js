// index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import pool from './src/config/db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
app.use(helmet());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// healthcheck
app.get('/', (req, res) => res.json({ message: 'User Management API running' }));

// test DB connection on startup
(async () => {
  try {
    const client = await pool.connect();
    client.release();
    console.log('DB connected');
  } catch (err) {
    console.error('DB connection error:', err.message);
  }
})();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
