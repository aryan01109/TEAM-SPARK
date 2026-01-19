import express from "express";
import auth from "../middleware/auth.js";
import Community from "../models/CommunityPost.js"; 
import { getCommunityReports } from "../controllers/community.controller.js";

const router = express.Router();

/* =============================
   COMMUNITY FEED (PUBLIC)
   GET /api/community
============================= */
router.get("/community", getCommunityReports);

/* =============================
   LIKE A POST (AUTH REQUIRED)
   POST /api/community/like/:id
============================= */
router.post("/community/like/:id", auth, async (req, res) => {
  try {
    const post = await Community.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1, impactScore: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({
      success: true,
      likes: post.likes,
      impactScore: post.impactScore
    });
  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ message: "Like failed" });
  }
});

/* =============================
   TRENDING POSTS (PUBLIC)
   GET /api/community/trending
============================= */
router.get("/community/trending", async (req, res) => {
  try {
    const posts = await Community.find()
      .sort({ impactScore: -1 })
      .limit(5)
      .lean();

    res.json(
      posts.map(p => ({
        title: p.title,
        score: p.impactScore,
        tag: p.impactScore > 15 ? "Urgent" : "Event"
      }))
    );
  } catch (err) {
    console.error("TRENDING ERROR:", err);
    res.status(500).json({ message: "Failed to load trending" });
  }
});

/* =============================
   IMPACT HEROES (PUBLIC)
   GET /api/community/heroes
============================= */
router.get("/community/heroes", async (req, res) => {
  try {
    const data = await Community.aggregate([
      {
        $group: {
          _id: "$userName",
          points: { $sum: "$impactScore" }
        }
      },
      { $sort: { points: -1 } },
      { $limit: 5 }
    ]);

    res.json(
      data.map(u => ({
        name: u._id,
        points: u.points
      }))
    );
  } catch (err) {
    console.error("HEROES ERROR:", err);
    res.status(500).json({ message: "Failed to load heroes" });
  }
});

export default router;
