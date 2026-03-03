import express from "express";
import Variant from "../models/Variant.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const variants = await Variant.find();
    res.json(variants);
  } catch (err) {
    res.status(500).json({ message: "Error fetching variants" });
  }
});

export default router;
