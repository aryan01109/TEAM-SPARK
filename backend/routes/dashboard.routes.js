import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/", auth, role("admin"), getDashboardStats);

export default router;
