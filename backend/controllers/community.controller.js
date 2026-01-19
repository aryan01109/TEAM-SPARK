// import CommunityPost from "../models/CommunityPost.js";

// /* =====================================================
//    GET COMMUNITY POSTS (PUBLIC)
//    Source: communityposts collection
// ===================================================== */
// export const getCommunityReports = async (req, res) => {
//   try {
//     const posts = await CommunityPost.find()
//       .sort({ createdAt: -1 })
//       .limit(50)
//       .lean();

//     const formatted = posts.map(p => ({
//       _id: p._id,
//       reportId: p.reportId,

//       title: p.title || "Civic Issue",
//       description: p.description || "",
//       category: p.category || "General",
//       location: p.location || "",

//       beforeImage: p.beforeImage || null,
//       afterImage: p.afterImage || null,

//       likes: p.likes || 0,
//       impactScore: p.impactScore || 0,

//       user: {
//         id: p.userId,
//         name: p.userName || "Citizen"
//       },

//       createdAt: p.createdAt
//     }));

//     res.json({
//       success: true,
//       count: formatted.length,
//       posts: formatted
//     });

//   } catch (err) {
//     console.error("COMMUNITY CONTROLLER ERROR:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to load community posts"
//     });
//   }
// };

import Community from "../models/CommunityPost.js";

export const getCommunityReports = async (req, res) => {
    console.log("COMMUNITY ROUTE HIT 1");

  try {
    const posts = await Community.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(posts);
  } catch (err) {
    console.error("COMMUNITY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
