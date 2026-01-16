import Report from "../models/Report.js";
import User from "../models/User.js";

/* =====================================================
   ADMIN DASHBOARD STATS
   ===================================================== */
export const getDashboardStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();

    // ⚠️ Make sure status value matches your schema
    const activeReports = await Report.countDocuments({
      status: { $in: ["open", "Open"] }
    });

    const users = await User.countDocuments();

    return res.status(200).json({
      totalReports,
      activeReports,

      // 🔹 Mock / placeholder stats (UI only)
      avgResolution: "4.2 hrs",
      activeCrews: 42,
      satisfaction: "88.4%",

      users
    });

  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error);
    return res.status(500).json({
      message: "Failed to load dashboard statistics"
    });
  }
};
