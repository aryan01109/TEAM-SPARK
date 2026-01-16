import Admin from "../models/Admin.js";

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);

  } catch (error) {
    console.error("PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
