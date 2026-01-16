import jwt from "jsonwebtoken";

/* =====================================================
   ADMIN AUTH MIDDLEWARE (JWT)
   ===================================================== */
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Missing or invalid Authorization header"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey"
    );

    // ✅ ROLE CHECK (FIXED)
    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden: Admins only"
      });
    }

    req.user = decoded;
    next();

  } catch (error) {
    console.error("Admin JWT verification failed:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

export default adminAuth;
