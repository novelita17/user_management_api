// src/config/db.js
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
  // apabila ingin pakai var terpisah, ganti dengan object config
});

export default pool;
