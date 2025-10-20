// src/models/userModel.js
import pool from '../config/db.js';

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  return rows[0];
};

export const findUserById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, username, email, role, avatar_url, created_at, updated_at FROM users WHERE id=$1',
    [id]
  );
  return rows[0];
};

export const createUser = async (username, email, hashedPassword) => {
  const { rows } = await pool.query(
    'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, role, avatar_url, created_at, updated_at',
    [username, email, hashedPassword]
  );
  return rows[0];
};

export const updateUserById = async (id, fields = {}) => {
  const updates = [];
  const values = [];
  let idx = 1;
  for (const key in fields) {
    updates.push(`${key}=$${idx}`);
    values.push(fields[key]);
    idx++;
  }
  if (updates.length === 0) return null;
  values.push(id);
  const query = `UPDATE users SET ${updates.join(',')}, updated_at = now() WHERE id=$${idx} RETURNING id, username, email, role, avatar_url, updated_at`;
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const deleteUserById = async (id) => {
  await pool.query('DELETE FROM users WHERE id=$1', [id]);
};
