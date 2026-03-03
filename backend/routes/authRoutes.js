import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();
const SECRET = "LRR_SECRET_KEY";

// إنشاء مستخدم (للـ FOUNDER فقط)
router.post("/create", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashed,
      role
    });

    res.json({ message: "User created", user });
  } catch (err) {
    res.status(500).json({ message: "Error creating user" });
  }
});

// تسجيل الدخول
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Logged in",
      token,
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
});

export default router;
