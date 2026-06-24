import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { connectDB } from "../lib/db.js";

export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }

      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }

      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!decoded?.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    await connectDB();

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (
      user.passwordChangedAt &&
      decoded.iat * 1000 < user.passwordChangedAt.getTime()
    ) {
      return res.status(401).json({
        message: "Password changed. Please login again.",
      });
    }

    req.userId = user._id;

    req.user = {
      _id: user._id,
      role: user.role,
      organizationId: user.organizationId,
      email: user.email,
      name: user.name,
    };

    next();

  } catch (error) {
    console.error("protectRoute unexpected error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
