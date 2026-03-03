import express from "express";
import Return from "../models/Return.js";
import Variant from "../models/Variant.js";
import InventoryLog from "../models/InventoryLog.js";
import { auth } from "../middleware/authMiddleware.js"; // ← التعديل هنا

const router = express.Router();

// إنشاء عملية إرجاع / تبديل
router.post("/", auth, async (req, res) => {
  try {
    const { saleId, type, itemsReturned, itemsGiven, reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }

    // حساب مبلغ الإرجاع
    const refundAmount = itemsReturned.reduce(
      (sum, i) => sum + i.discountedPrice * (i.quantity || 1),
      0
    );

    // إعادة المنتجات للمخزون
    for (const item of itemsReturned) {
      await Variant.findByIdAndUpdate(item.variantId, {
        $inc: { stock: item.quantity },
      });

      await InventoryLog.create({
        variantId: item.variantId,
        change: item.quantity,
        reason: "return",
        createdBy: req.user.id,
      });
    }

    // خصم المنتجات المعطاة (في حالة التبديل)
    for (const item of itemsGiven || []) {
      await Variant.findByIdAndUpdate(item.variantId, {
        $inc: { stock: -item.quantity },
      });

      await InventoryLog.create({
        variantId: item.variantId,
        change: -item.quantity,
        reason: "exchange",
        createdBy: req.user.id,
      });
    }

    // حفظ عملية الإرجاع
    const ret = await Return.create({
      saleId,
      type,
      itemsReturned,
      itemsGiven,
      refundAmount,
      reason,
      createdBy: req.user.id,
    });

    res.json(ret);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error processing return" });
  }
});

export default router;