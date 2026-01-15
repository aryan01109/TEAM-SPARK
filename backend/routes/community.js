import express from "express";
import auth from "../middleware/auth.js";
import Community from "../models/CommunityPost.js";

const router = express.Router();

/* =============================
   GET COMMUNITY FEED
   /api/community?mode=recent | impactful | following
============================= */
router.get("/", auth, async (req, res) => {
  try {
    const mode = req.query.mode || "recent";

    let sort = { createdAt: -1 };
    if (mode === "impactful") sort = { impactScore: -1, createdAt: -1 };
    if (mode === "following") sort = { likes: -1, createdAt: -1 };

    const posts = await Community.find()
      .sort(sort)
      .limit(50)
      .lean();

    res.json(posts);
  } catch (err) {
    console.error("COMMUNITY FEED ERROR:", err);
    res.status(500).json({ message: "Failed to load community feed" });
  }
});

/* =============================
   LIKE A POST
============================= */
router.post("/like/:id", auth, async (req, res) => {
  try {
    const post = await Community.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1, impactScore: 1 } },
      { new: true }
    );

    if (!post) return res.status(404).json({ message: "Post not found" });

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
   TRENDING POSTS
============================= */
router.get("/trending", async (req, res) => {
  try {
    const posts = await Community.find()
      .sort({ impactScore: -1 })
      .limit(5)
      .lean();

    res.json(posts.map(p => ({
      title: p.title,
      score: p.impactScore,
      tag: p.impactScore > 15 ? "Urgent" : "Event"
    })));
  } catch (err) {
    console.error("TRENDING ERROR:", err);
    res.status(500).json({ message: "Failed to load trending" });
  }
});

/* =============================
   IMPACT HEROES
============================= */
router.get("/heroes", async (req, res) => {
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

    res.json(data.map(u => ({
      name: u._id,
      points: u.points
    })));
  } catch (err) {
    console.error("HEROES ERROR:", err);
    res.status(500).json({ message: "Failed to load heroes" });
  }
});

export default router;
