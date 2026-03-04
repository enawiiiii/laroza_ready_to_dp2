import mongoose from "mongoose";
import { ROLES } from "../utils/roles.js";

const employeeSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.EMPLOYEE },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);