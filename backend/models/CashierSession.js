import mongoose from "mongoose";

const cashierSessionSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  openingTime: { type: Date, default: Date.now },
  closingTime: { type: Date },

  openingCash: { type: Number, required: true },
  closingCash: { type: Number },

  totalSales: { type: Number, default: 0 },
  totalCashSales: { type: Number, default: 0 },
  totalCardSales: { type: Number, default: 0 },
  totalExpenses: { type: Number, default: 0 },

  difference: { type: Number, default: 0 },

  status: { type: String, enum: ["open", "closed"], default: "open" },
});

export default mongoose.model("CashierSession", cashierSessionSchema);
