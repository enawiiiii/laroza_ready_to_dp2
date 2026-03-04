import mongoose from "mongoose";

const SizeSchema = new mongoose.Schema({
  sizeName: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 }
});

const VariantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  sizes: { type: [SizeSchema], required: true }
});

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },          // اسم المنتج (عربي/إنجليزي)
    brand: { type: String, required: true },         // اسم الشركة
    productCode: { type: String, required: true },   // كود المنتج (يدوي)
    category: { type: String },                      // اختياري
    price: { type: Number, required: true },         // سعر البيع
    image: { type: String, required: true },         // مسار الصورة أو رابط
    variants: { type: [VariantSchema], required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
