const express = require("express");
const router = express.Router();

router.get("/statistics", async (req, res) => {
    try {
        res.json({
            totalUsers: 120,
            totalIssues: 45,
            resolvedIssues: 32,
            pendingIssues: 13
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
