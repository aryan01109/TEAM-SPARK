import Report from "../models/Report.js";

/* =====================================================
   GET ALL REPORTS (FILTERABLE – ADMIN)
===================================================== */
export const getReports = async (req, res) => {
  try {
    const { search, status, priority } = req.query;

    const query = {};

    // Status filter
    if (status && status !== "all") {
      query.status = status;
    }

    // Priority filter
    if (priority && priority !== "all") {
      query.priority = priority;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const formatted = reports.map(r => ({
      _id: r._id,                
      userId: r.userId,
      title: r.title,
      category: r.category,
      location: r.location,
      priority: r.priority || "low",
      status: r.status || "Submitted",
      department: r.department || "Unassigned",
      createdAt: r.createdAt,     
      timeAgo: timeAgo(r.createdAt)
    }));

    res.json(formatted);

  } catch (err) {
    console.error("GET REPORTS ERROR:", err);
    res.status(500).json({ message: "Failed to load reports" });
  }
};

/* =====================================================
   TIME AGO HELPER
===================================================== */
function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hr", seconds: 3600 },
    { label: "min", seconds: 60 }
  ];

  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) {
      return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}


/* =====================================================
   create report
===================================================== */

export const createReport = async (req, res) => {
  try {
    const { title, category, description, location } = req.body;

    //  VALIDATE INPUT
    if (!title || !category || !description || !location) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    //  userId MUST come from token
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const report = await Report.create({
      userId: req.user.id,
      title,
      category,
      description,
      location
    });

    res.status(201).json({
      message: "Report submitted successfully",
      report
    });

  } catch (err) {
    console.error("REPORT CREATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};