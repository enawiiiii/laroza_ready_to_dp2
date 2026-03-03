import express from "express";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import uploadProductImage from "../middleware/uploadProductImage.js";
import { generateSKU, generateBarcode } from "../utils/codes.js";

const router = express.Router();

// جلب كل المنتجات
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// جلب منتج واحد
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

// إضافة منتج جديد
router.post(
  "/",
  uploadProductImage.single("image"),
  async (req, res) => {
    try {
      const {
        name,
        brand,
        productCode,
        category,
        price,
        variants
      } = req.body;

      if (!name || !brand || !productCode || !price || !variants) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      let imagePath = "";
      if (req.file) {
        imagePath = `/product-images/${req.file.filename}`;
      } else if (req.body.imageUrl) {
        imagePath = req.body.imageUrl;
      } else {
        return res.status(400).json({ message: "Product image is required" });
      }

      const parsedVariants = JSON.parse(variants);

      const product = await Product.create({
        name,
        brand,
        productCode,
        category: category || null,
        price,
        image: imagePath,
        variants: parsedVariants
      });

      const inventoryDocs = [];

      for (const variant of parsedVariants) {
        const color = variant.color;
        for (const size of variant.sizes) {
          const sizeName = size.sizeName;
          const quantity = Number(size.quantity) || 0;
          if (quantity <= 0) continue;

          const sku = generateSKU(productCode, color, sizeName);
          const barcode = generateBarcode();

          inventoryDocs.push({
            product: product._id,
            variantColor: color,
            sizeName,
            sku,
            barcode,
            quantity
          });
        }
      }

      if (inventoryDocs.length) {
        await Inventory.insertMany(inventoryDocs);
      }

      res.status(201).json({
        message: "Product created successfully",
        productId: product._id
      });
    } catch (err) {
      res.status(500).json({ message: "Error creating product" });
    }
  }
);

// تعديل منتج
router.put(
  "/:id",
  uploadProductImage.single("image"),
  async (req, res) => {
    try {
      const {
        name,
        brand,
        productCode,
        category,
        price,
        variants
      } = req.body;

      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });

      let imagePath = product.image;
      if (req.file) {
        imagePath = `/product-images/${req.file.filename}`;
      } else if (req.body.imageUrl) {
        imagePath = req.body.imageUrl;
      }

      const parsedVariants = JSON.parse(variants);

      product.name = name;
      product.brand = brand;
      product.productCode = productCode;
      product.category = category;
      product.price = price;
      product.image = imagePath;
      product.variants = parsedVariants;

      await product.save();

      // تحديث المخزون
      await Inventory.deleteMany({ product: product._id });

      const inventoryDocs = [];

      for (const variant of parsedVariants) {
        const color = variant.color;
        for (const size of variant.sizes) {
          const sizeName = size.sizeName;
          const quantity = Number(size.quantity) || 0;
          if (quantity <= 0) continue;

          const sku = generateSKU(productCode, color, sizeName);
          const barcode = generateBarcode();

          inventoryDocs.push({
            product: product._id,
            variantColor: color,
            sizeName,
            sku,
            barcode,
            quantity
          });
        }
      }

      if (inventoryDocs.length) {
        await Inventory.insertMany(inventoryDocs);
      }

      res.json({ message: "Product updated successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error updating product" });
    }
  }
);

export default router;