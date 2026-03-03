import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema(
  {
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
    change: Number, // + or -
    reason: String, // "sale", "return", "exchange", "manual_adjustment", "receiving"
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }
  },
  { timestamps: true }
);

export default mongoose.model("InventoryLog", inventoryLogSchema);