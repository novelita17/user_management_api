import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// ===============================
// ✅ Get semua user
// ===============================
export const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role, avatar_url, created_at, updated_at FROM users ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error getUsers:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// ===============================
// ✅ Get user by ID
// ===============================
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, username, email, role, avatar_url, created_at, updated_at FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error getUser:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

// ===============================
// ✅ Get profile user yang sedang login
// ===============================
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT id, username, email, role, avatar_url, created_at, updated_at FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error getProfile:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
};

// ===============================
// ✅ Update user (hanya dirinya sendiri)
// ===============================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    // Pastikan user hanya bisa update dirinya sendiri
    if (parseInt(id) !== req.user.id) {
      return res.status(403).json({ message: "Tidak dapat mengedit user lain" });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const query = `
      UPDATE users
      SET username = COALESCE($1, username),
          email = COALESCE($2, email),
          password = COALESCE($3, password),
          updated_at = NOW()
      WHERE id = $4
      RETURNING id, username, email, role, avatar_url, created_at, updated_at
    `;

    const result = await pool.query(query, [username, email, hashedPassword, id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error updateUser:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

// ===============================
// ✅ Upload avatar ke Cloudinary
// ===============================
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload dari buffer (karena memoryStorage)
    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "avatars" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const uploadResult = await uploadStream();

    // Simpan URL avatar ke database
    const result = await pool.query(
      "UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2 RETURNING avatar_url",
      [uploadResult.secure_url, userId]
    );

    res.json({
      message: "Avatar uploaded successfully",
      avatar_url: result.rows[0].avatar_url,
    });
  } catch (error) {
    console.error("❌ Error uploadAvatar:", error);
    res.status(500).json({ message: "Error uploading avatar", error: error.message });
  }
};

// ===============================
// ✅ Hapus user
// ===============================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Hanya user itu sendiri atau admin yang bisa menghapus
    if (req.user.role !== "admin" && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: "Tidak diizinkan menghapus user lain" });
    }

    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleteUser:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};
