import express from "express";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalInventoryItems = await Inventory.countDocuments();

    const totalQuantity = await Inventory.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);

    const lowStock = await Inventory.find({ quantity: { $lt: 5 } })
      .populate("product")
      .limit(10);

    const latestProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalProducts,
      totalInventoryItems,
      totalQuantity: totalQuantity[0]?.total || 0,
      lowStock,
      latestProducts
    });
  } catch (err) {
    res.status(500).json({ message: "Error loading dashboard" });
  }
});

export default router;