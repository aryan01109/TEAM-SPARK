import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const token = header.split(" ")[1];

    //  DECODE FIRST
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey"
    );

    //  NOW SAFE TO LOG
    console.log("DECODED TOKEN:", decoded);

    // attach admin to request
    req.user = decoded;

    // optional role check
    if (decoded.role && decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default adminAuth;
