import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
  productCode: String,
  color: String,
  size: String,
  originalPrice: Number,
  discountedPrice: Number,
  quantity: { type: Number, default: 1 }
});

const saleSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["inStore", "online"], required: true },
    source: { type: String, enum: ["whatsapp", "instagram", null], default: null },
    paymentType: {
      type: String,
      enum: ["cash", "visa", "cod", "bankTransfer"],
      required: true
    },
    customerName: String,
    customerPhone: String,
    customerAddress: String,
    trackingNumber: String,
    items: [saleItemSchema],
    vatAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }
  },
  { timestamps: true }
);

export default mongoose.model("Sale", saleSchema);
