import mongoose from "mongoose";

const returnItemSchema = new mongoose.Schema({
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
  productCode: String,
  color: String,
  size: String,
  discountedPrice: Number,
  quantity: { type: Number, default: 1 }
});

const returnSchema = new mongoose.Schema(
  {
    saleId: { type: mongoose.Schema.Types.ObjectId, ref: "Sale", required: true },
    type: { type: String, enum: ["return", "exchange"], required: true },
    itemsReturned: [returnItemSchema],
    itemsGiven: [returnItemSchema],
    refundAmount: { type: Number, default: 0 },
    reason: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }
  },
  { timestamps: true }
);

export default mongoose.model("Return", returnSchema);
