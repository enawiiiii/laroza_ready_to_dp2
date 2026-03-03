import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "your-secret-key-123";

// In-memory database
const db = {
  users: [
    { _id: "1", username: "admin", password: "admin123", role: "admin", name: "مدير النظام" },
    { _id: "2", username: "manager", password: "manager123", role: "manager", name: "مشرف المتجر" },
    { _id: "3", username: "cashier", password: "cashier123", role: "cashier", name: "كاشير" },
  ],
  products: [
    { _id: "p1", name: "قميص أزرق", productCode: "SHIRT-001", price: 150, category: "ملابس", brand: "Brand A", image: null },
    { _id: "p2", name: "بنطال أسود", productCode: "PANTS-001", price: 250, category: "ملابس", brand: "Brand B", image: null },
    { _id: "p3", name: "حذاء رياضي", productCode: "SHOE-001", price: 400, category: "أحذية", brand: "Brand C", image: null },
  ],
  variants: [
    { _id: "v1", productCode: "SHIRT-001", productName: "قميص أزرق", color: "أزرق", size: "M", price: 150, stock: 50 },
    { _id: "v2", productCode: "SHIRT-001", productName: "قميص أزرق", color: "أحمر", size: "L", price: 150, stock: 30 },
    { _id: "v3", productCode: "PANTS-001", productName: "بنطال أسود", color: "أسود", size: "32", price: 250, stock: 25 },
    { _id: "v4", productCode: "SHOE-001", productName: "حذاء رياضي", color: "أبيض", size: "42", price: 400, stock: 15 },
  ],
  inventory: [
    { _id: "inv1", product: { _id: "p1", name: "قميص أزرق", productCode: "SHIRT-001" }, variantColor: "أزرق", sizeName: "M", quantity: 50 },
    { _id: "inv2", product: { _id: "p1", name: "قميص أزرق", productCode: "SHIRT-001" }, variantColor: "أحمر", sizeName: "L", quantity: 30 },
    { _id: "inv3", product: { _id: "p2", name: "بنطال أسود", productCode: "PANTS-001" }, variantColor: "أسود", sizeName: "32", quantity: 25 },
    { _id: "inv4", product: { _id: "p3", name: "حذاء رياضي", productCode: "SHOE-001" }, variantColor: "أبيض", sizeName: "42", quantity: 15 },
  ],
  sales: [
    { _id: "sale1", items: [{ productCode: "SHIRT-001", color: "أزرق", size: "M", quantity: 2, price: 150 }], totalAmount: 315, vatAmount: 15, paymentMethod: "cash", cashierName: "كاشير", createdAt: new Date() },
  ],
  employees: [
    { _id: "2", name: "مشرف المتجر", username: "manager", role: "manager", createdAt: new Date() },
    { _id: "3", name: "كاشير", username: "cashier", role: "cashier", createdAt: new Date() },
  ],
};

// Auth Routes
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  
  const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, { expiresIn: "24h" });
  res.json({ token, user: { _id: user._id, username: user.username, role: user.role, name: user.name } });
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Dashboard
app.get("/api/dashboard", verifyToken, (req, res) => {
  res.json({
    totalSales: 5000,
    totalRevenue: 15000,
    totalProducts: db.products.length,
    totalInventory: db.inventory.reduce((sum, item) => sum + item.quantity, 0),
    recentSales: db.sales.slice(0, 5),
  });
});

// Products
app.get("/api/products", verifyToken, (req, res) => {
  res.json(db.products);
});

app.get("/api/products/:id", verifyToken, (req, res) => {
  const product = db.products.find(p => p._id === req.params.id);
  res.json(product || {});
});

app.post("/api/products", verifyToken, (req, res) => {
  const newProduct = { _id: "p" + Date.now(), ...req.body };
  db.products.push(newProduct);
  res.json(newProduct);
});

app.put("/api/products/:id", verifyToken, (req, res) => {
  const idx = db.products.findIndex(p => p._id === req.params.id);
  if (idx !== -1) db.products[idx] = { ...db.products[idx], ...req.body };
  res.json(db.products[idx] || {});
});

app.delete("/api/products/:id", verifyToken, (req, res) => {
  db.products = db.products.filter(p => p._id !== req.params.id);
  res.json({ success: true });
});

// Inventory & Variants - IMPORTANT FOR POS
app.get("/api/inventory", verifyToken, (req, res) => {
  res.json(db.inventory);
});

app.get("/api/inventory/product/:id", verifyToken, (req, res) => {
  const items = db.inventory.filter(i => i.product._id === req.params.id);
  res.json(items);
});

// FIX: Add variants endpoint for POS
app.get("/api/inventory/variants", verifyToken, (req, res) => {
  res.json(db.variants);
});

app.get("/api/variants", verifyToken, (req, res) => {
  res.json(db.variants);
});

// Sales
app.get("/api/sales", verifyToken, (req, res) => {
  res.json(db.sales);
});

app.get("/api/sales/:id", verifyToken, (req, res) => {
  const sale = db.sales.find(s => s._id === req.params.id);
  res.json(sale || {});
});

app.post("/api/sales", verifyToken, (req, res) => {
  const newSale = { _id: "sale" + Date.now(), ...req.body, createdAt: new Date() };
  db.sales.push(newSale);
  res.json(newSale);
});

// Returns
app.get("/api/returns", verifyToken, (req, res) => {
  res.json([]);
});

app.post("/api/returns", verifyToken, (req, res) => {
  res.json({ success: true });
});

// Employees
app.get("/api/employees", verifyToken, (req, res) => {
  res.json(db.employees);
});

app.post("/api/employees", verifyToken, (req, res) => {
  const newEmp = { _id: "e" + Date.now(), ...req.body, createdAt: new Date() };
  db.employees.push(newEmp);
  res.json(newEmp);
});

app.delete("/api/employees/:id", verifyToken, (req, res) => {
  db.employees = db.employees.filter(e => e._id !== req.params.id);
  res.json({ success: true });
});

// Reports
app.get("/api/reports", verifyToken, (req, res) => {
  res.json({ totalSales: db.sales.length, totalRevenue: 15000 });
});

// Cashier
app.post("/api/cashier/close", verifyToken, (req, res) => {
  res.json({ success: true, message: "تم إغلاق الوردية" });
});

// Start server
app.listen(5000, () => console.log("Mock Backend running on port 5000"));
