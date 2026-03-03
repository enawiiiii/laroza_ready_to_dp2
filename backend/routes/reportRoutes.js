import express from "express";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";

const router = express.Router();

// تقرير المنتجات
router.get("/products", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    const totalVariants = await Product.aggregate([
      { $unwind: "$variants" },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    const totalSizes = await Product.aggregate([
      { $unwind: "$variants" },
      { $unwind: "$variants.sizes" },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    const latestProducts = await Product.find().sort({ createdAt: -1 }).limit(10);

    res.json({
      totalProducts,
      totalVariants: totalVariants[0]?.count || 0,
      totalSizes: totalSizes[0]?.count || 0,
      latestProducts
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating report" });
  }
});

// تقرير المخزون
router.get("/inventory", async (req, res) => {
  try {
    const totalItems = await Inventory.countDocuments();

    const totalQuantity = await Inventory.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);

    const lowStock = await Inventory.find({ quantity: { $lt: 5 } })
      .populate("product")
      .limit(20);

    const outOfStock = await Inventory.find({ quantity: 0 })
      .populate("product");

    res.json({
      totalItems,
      totalQuantity: totalQuantity[0]?.total || 0,
      lowStock,
      outOfStock
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating inventory report" });
  }
});

export default router;
