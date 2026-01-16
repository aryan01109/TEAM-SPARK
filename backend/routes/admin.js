import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import { getAdminProfile } from "../controllers/adminProfile.controller.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/profile", adminAuth, getAdminProfile);
router.get("/dashboard/stats", adminAuth, getDashboardStats);

export default router;
