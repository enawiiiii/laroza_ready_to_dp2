import express from "express";
import Sale from "../models/Sale.js";
import Inventory from "../models/Inventory.js";

const router = express.Router();

/* ---------------------------------------------------
GET — جلب كل الفواتير (Sales History)
--------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sales" });
  }
});

/* ---------------------------------------------------
GET — جلب فاتورة واحدة بالتفصيل
--------------------------------------------------- */
router.get("/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate(
      "createdBy",
      "username"
    );

    if (!sale) return res.status(404).json({ message: "Sale not found" });

    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sale" });
  }
});

/* ---------------------------------------------------
POST — إنشاء فاتورة جديدة (Checkout)
--------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const {
      type,
      source,
      paymentType,
      customerName,
      customerPhone,
      customerAddress,
      trackingNumber,
      items,
      vatAmount,
      totalAmount,
      createdBy,
    } = req.body;

    const sale = await Sale.create({
      type,
      source,
      paymentType,
      customerName,
      customerPhone,
      customerAddress,
      trackingNumber,
      items,
      vatAmount,
      totalAmount,
      createdBy,
    });

    // تحديث المخزون
    for (const item of items) {
      await Inventory.findOneAndUpdate(
        {
          variantId: item.variantId,
          variantColor: item.color,
          sizeName: item.size,
        },
        { $inc: { quantity: -item.quantity } }
      );
    }

    res.json({ message: "Sale completed", saleId: sale._id });
  } catch (err) {
    res.status(500).json({ message: "Error creating sale" });
  }
});

export default router;