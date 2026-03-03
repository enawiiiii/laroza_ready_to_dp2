import express from "express";
import CashierSession from "../models/CashierSession.js";
import Sale from "../models/Sale.js";

const router = express.Router();

// فتح شفت جديد
router.post("/open", async (req, res) => {
  const { employeeId, openingCash } = req.body;

  const openSession = await CashierSession.findOne({
    employeeId,
    status: "open",
  });

  if (openSession) {
    return res.status(400).json({ message: "يوجد شفت مفتوح بالفعل" });
  }

  const session = await CashierSession.create({
    employeeId,
    openingCash,
  });

  res.json(session);
});

// إغلاق الشفت
router.post("/close", async (req, res) => {
  const { employeeId, closingCash } = req.body;

  const session = await CashierSession.findOne({
    employeeId,
    status: "open",
  });

  if (!session) {
    return res.status(400).json({ message: "لا يوجد شفت مفتوح" });
  }

  const sales = await Sale.find({
    createdBy: employeeId,
    createdAt: { $gte: session.openingTime },
  });

  const totalSales = sales.reduce((s, i) => s + i.totalAmount, 0);
  const totalCashSales = sales
    .filter((s) => s.paymentType === "cash")
    .reduce((s, i) => s + i.totalAmount, 0);

  const totalCardSales = sales
    .filter((s) => s.paymentType !== "cash")
    .reduce((s, i) => s + i.totalAmount, 0);

  const difference = closingCash - (session.openingCash + totalCashSales);

  session.closingTime = new Date();
  session.closingCash = closingCash;
  session.totalSales = totalSales;
  session.totalCashSales = totalCashSales;
  session.totalCardSales = totalCardSales;
  session.difference = difference;
  session.status = "closed";

  await session.save();

  res.json(session);
});

// جلب الشفت الحالي
router.get("/current/:employeeId", async (req, res) => {
  const session = await CashierSession.findOne({
    employeeId: req.params.employeeId,
    status: "open",
  });

  res.json(session);
});

export default router;