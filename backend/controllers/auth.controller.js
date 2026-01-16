export const loginAdmin = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.trim().toLowerCase();

    const admin = await Admin
      .findOne({ email })
      .select("+password");

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (!admin.isApproved) {
      return res.status(403).json({
        message: "Admin approval pending"
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Server error during login"
    });
  }
};
