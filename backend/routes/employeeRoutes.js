import express from "express";
import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../utils/roles.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  requireRoles(ROLES.ADMIN, ROLES.FOUNDER),
  async (req, res) => {
    const employees = await Employee.find().select("-passwordHash");
    res.json(employees);
  }
);

router.post(
  "/",
  authMiddleware,
  requireRoles(ROLES.ADMIN, ROLES.FOUNDER),
  async (req, res) => {
    const { username, password, fullName, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const emp = await Employee.create({ username, passwordHash: hash, fullName, role });
    res.json(emp);
  }
);

router.patch(
  "/:id",
  authMiddleware,
  requireRoles(ROLES.ADMIN, ROLES.FOUNDER),
  async (req, res) => {
    const { fullName, role, active } = req.body;
    const emp = await Employee.findByIdAndUpdate(
      req.params.id,
      { fullName, role, active },
      { new: true }
    ).select("-passwordHash");
    res.json(emp);
  }
);

export default router;
