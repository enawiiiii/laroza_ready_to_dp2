import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantColor: { type: String, required: true },
    sizeName: { type: String, required: true },

    sku: { type: String, required: true },      // يتولد تلقائيًا
    barcode: { type: String, required: true },  // يتولد تلقائيًا

    quantity: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Inventory", InventorySchema);
