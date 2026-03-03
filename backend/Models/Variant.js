import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productCode: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    barcode: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Variant", variantSchema);