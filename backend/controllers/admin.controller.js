import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Report from "../models/Report.js";

/* =====================================================
   REGISTER ADMIN
===================================================== */
export const registerAdmin = async (req, res) => {
  try {
    const {
      name,
      empId,
      email,
      department,
      designation,
      govId,
      password
    } = req.body;

    if (!email || !password || !empId) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const exists = await Admin.findOne({
      $or: [{ email: email.toLowerCase() }, { empId }]
    });

    if (exists) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      name,
      empId,
      email: email.toLowerCase(),
      department,
      designation,
      govId,
      password: hashedPassword,
      role: "admin",
      isApproved: true
    });

    res.status(201).json({ message: "Admin registered successfully" });

  } catch (err) {
    console.error("REGISTER ADMIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   LOGIN ADMIN
===================================================== */
export const loginAdmin = async (req, res) => {
  try {
    const { empId, email, password } = req.body;

    if ((!empId && !email) || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const admin = await Admin.findOne({
      $or: [{ email: email?.toLowerCase() }, { empId }]
    });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!admin.isApproved) {
      return res.status(403).json({ message: "Admin approval pending" });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        email: admin.email
      },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        empId: admin.empId,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    console.error("LOGIN ADMIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   DASHBOARD KPI STATS (FIXED FOR YOUR DB)
===================================================== */
export const getDashboardStats = async (req, res) => {
  try {
    // 1️ Total Reports
    const totalReports = await Report.countDocuments();

    // 2️ Resolved Reports
    const resolvedReports = await Report.countDocuments({
      status: { $in: ["Resolved", "Closed"] }
    });

    // 3️ Avg Resolution Time (SAFE)
    const avgAgg = await Report.aggregate([
      {
        $match: {
          status: { $in: ["Resolved", "Closed"] },
          resolvedAt: { $exists: true }
        }
      },
      {
        $project: {
          hours: {
            $divide: [
              { $subtract: ["$resolvedAt", "$createdAt"] },
              1000 * 60 * 60
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolution: { $avg: "$hours" }
        }
      }
    ]);

    const avgResolution = avgAgg[0]?.avgResolution
      ? Number(avgAgg[0].avgResolution.toFixed(1))
      : 0;

    res.json({
      totalReports,
      avgResolution,
      activeCrews: 0,    
      satisfaction: 0    
    });

  } catch (err) {
    console.error("DASHBOARD STATS ERROR:", err);
    res.status(500).json({ message: "Dashboard stats error" });
  }
};

/* =====================================================
   GET ALL REPORTS (ADMIN MAP + TABLE) – FIXED
===================================================== */
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    const formatted = reports.map(r => {
      let lat = null;
      let lng = null;

      // 🔧 Handle BOTH location formats
      if (typeof r.location === "string") {
        const parts = r.location.split(",").map(v => Number(v.trim()));
        lat = parts[0];
        lng = parts[1];
      } else if (r.location?.lat && r.location?.lng) {
        lat = r.location.lat;
        lng = r.location.lng;
      }

      return {
        id: r.reportId || r._id,
        title: r.title || r.category,
        category: r.category,
        status: r.status,
        lat,
        lng,
        date: r.createdAt
      };
    });

    res.json(formatted);

  } catch (error) {
    console.error("REPORT FETCH ERROR:", error);
    res.status(500).json({ message: "Failed to load reports" });
  }
};
