import express from "express";
import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";

const router = express.Router();

// جلب كل المخزون
router.get("/", async (req, res) => {
  try {
    const inventory = await Inventory.find().populate("product");
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: "Error fetching inventory" });
  }
});

// تعديل الكمية
router.put("/:id", async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Error updating quantity" });
  }
});

// حذف سطر مخزون
router.delete("/:id", async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting item" });
  }
});

export default router;
