const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "Admin") return res.status(403).json({ message: "Forbidden" });
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Admin JWT verification failed:", err.message);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
