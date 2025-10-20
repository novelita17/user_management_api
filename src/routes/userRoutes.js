import express from "express";
import {
  getUsers,
  getUser,
  getProfile,
  updateUser,
  uploadAvatar,
  deleteUser
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ✅ GET Profile user login
router.get("/profile", verifyToken, getProfile);

// ✅ GET semua user (hanya admin)
router.get("/", verifyToken, getUsers);

// ✅ GET user by id
router.get("/:id", verifyToken, getUser);

// ✅ UPDATE user by id
router.put("/:id", verifyToken, updateUser);

// ✅ Upload avatar
router.post("/avatar", verifyToken, upload.single("file"), uploadAvatar);

// ✅ Hapus user
router.delete("/:id", verifyToken, deleteUser);

export default router;
