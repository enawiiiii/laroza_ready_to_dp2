import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/pos_system");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
