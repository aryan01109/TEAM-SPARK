import express from "express";
import User from "../models/User.js";
import Report from "../models/Report.js";
import Community from "../models/CommunityPost.js";
import UserStats from "../models/userstats.js";
import Activity from "../models/Activity.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ===========================
   USER PROFILE DASHBOARD
=========================== */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    /* -------------------
       USER
    -------------------- */
    const user = await User.findById(userId);
    const name = user.name;
    const email = user.email;
    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();

    /* -------------------
       REPORTS
    -------------------- */
    const reports = await Report.find({ userId });
    const resolved = reports.filter(r => r.status === "Resolved").length;
    const total = reports.length;

    /* -------------------
       USER STATS
    -------------------- */
    let stats = await UserStats.findOne({ userId });
    if (!stats) {
      stats = await UserStats.create({
        userId,
        reports: total,
        photos: 0,
        points: total * 20
      });
    }

    const points = stats.points;

    /* -------------------
       LEADERBOARD
    -------------------- */
    const leaders = await UserStats.find()
      .sort({ points: -1 })
      .limit(10)
      .populate("userId", "name");

    const leaderboard = leaders.map(l => ({
      name: l.userId.name,
      points: l.points,
      reports: l.reports
    }));

    const rank =
      leaders.findIndex(l => l.userId._id.toString() === userId) + 1;

    const topPoints = leaders[0]?.points || 0;
    const pointsToLeader = Math.max(topPoints - points, 0);
    const progressToLeader = topPoints
      ? Math.min((points / topPoints) * 100, 100)
      : 100;

    /* -------------------
       BADGES
    -------------------- */
    const upvotes = await Community.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: "$likes" } } }
    ]);

    const totalUpvotes = upvotes[0]?.total || 0;

    const badges = [
      { title: "First Reporter", desc: "Submitted your first report", icon: "🏅", earned: total >= 1 },
      { title: "Photo Pro", desc: "Added photos to 10 reports", icon: "📸", earned: stats.photos >= 10 },
      { title: "Location Expert", desc: "Provided precise locations", icon: "📍", earned: total >= 5 },
      { title: "Community Helper", desc: "Received 50 upvotes", icon: "🤝", earned: totalUpvotes >= 50 },
      { title: "Quick Responder", desc: "Reported within 1 hour", icon: "⚡", earned: false },
      { title: "Neighborhood Watch", desc: "Reported 50 issues", icon: "👁️", earned: total >= 50 }
    ];

    /* -------------------
       ACTIVITY
    -------------------- */
    const activity = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedActivity = activity.map(a => ({
      title: a.title,
      date: a.createdAt.toISOString().split("T")[0],
      points: a.points
    }));

    /* -------------------
       IMPACT
    -------------------- */
    const impact = {
      helpedResolved: resolved,
      upvotes: totalUpvotes,
      avgResponseDays: 2.3, // can be calculated later
      contributionTimeline: {
        resolved,
        inProgress: total - resolved,
        successRate: total ? Math.round((resolved / total) * 100) : 0
      }
    };

    /* -------------------
       RESPONSE
    -------------------- */
    res.json({
      name,
      email,
      initials,
      roleLabel: "Civic Champion",
      totals: { reports: total, resolved, points, rank },
      progressToLeader,
      pointsToLeader,
      badges,
      activity: formattedActivity,
      impact,
      leaderboard
    });

  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});

export default router;
