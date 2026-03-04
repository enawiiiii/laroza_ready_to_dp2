import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Routes
import salesRoutes from "./routes/saleRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import returnRoutes from "./routes/returnRoutes.js";
import cashierRoutes from "./routes/cashier.js";

// Models
import User from "./models/User.js";
import bcrypt from "bcryptjs";

const app = express();

app.use(cors());
app.use(express.json());

// Static folder for product images
app.use("/product-images", express.static("product-images"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/cashier", cashierRoutes); // ← تم التعديل هنا

// Function to ensure admin user exists
async function ensureAdminUser() {
  try {
    const exists = await User.findOne({ username: "admin" });

    if (!exists) {
      const hashed = await bcrypt.hash("123456", 10);

      await User.create({
        username: "admin",
        password: hashed,
        role: "admin"
      });

      console.log("✔ Admin user created: admin / 123456");
    } else {
      console.log("✔ Admin user already exists");
    }
  } catch (err) {
    console.log("Error ensuring admin user:", err);
  }
}

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/LRR")
  .then(async () => {
    console.log("MongoDB Connected");
    await ensureAdminUser();
  })
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));