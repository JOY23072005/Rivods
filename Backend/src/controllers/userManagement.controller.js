import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import Organization from "../models/organization.model.js";

import { connectDB } from "../lib/db.js";

export const createUser = async (
  req,
  res
) => {
  try {

    await connectDB();

    const {
      name,
      email,
      password,
      phone,
      gender,
      dob,
      role,
      employeeId,
    } = req.body;

    const existingUser =
      await User.findOne({
        organizationId:
          req.user
            .organizationId,
        email,
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        organizationId:
          req.user
            .organizationId,

        name,
        email,
        phone,
        password:
          hashedPassword,

        gender,
        dob,

        employeeId,

        role: role,
      });

    return res.status(201).json({
      success: true,
      user,
    });

  } catch (error) {

    console.log(
      "createUser",
      error
    );

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    await connectDB();

    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Cannot change yourself
    if (user._id.toString() === req.userId.toString()) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    // Admin permissions
    if (req.user.role === "admin") {
      const allowedRoles = [
        "user",
        "staff",
        "sub-admin",
      ];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message: "Invalid role",
        });
      }
    }

    else if (req.user.role === "sub-admin") {
      const allowedRoles = [
        "user",
        "staff",
      ];

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          message:
            "You are not allowed to assign this role",
        });
      }

      // Prevent managing users outside own organization
      if (
        user.organizationId.toString() !==
        req.user.organizationId.toString()
      ) {
        return res.status(403).json({
          message: "Unauthorized",
        });
      }
    }

    user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      role: user.role,
    });

  } catch (error) {

    console.log(
      "updateUserRole:",
      error.message
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getUsers = async (
  req,
  res
) => {
  try {

    await connectDB();

    const users =
      await User.find({
        organizationId:
          req.user
            .organizationId,
      })
        .select(
          "-password"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
};

export const getAllUsers = async (
  req,
  res
) => {
  try {

    await connectDB();

    const users =
      await User.find()
        .populate(
          "organizationId",
          "name code"
        )
        .select(
          "-password"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count:
        users.length,
      users,
    });

  } catch (error) {

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
};

export const updateUserStatus = async (
  req,
  res
) => {
  try {
    await connectDB();

    const { isActive } = req.body;

    const user = await User.findById(
      req.params.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isActive = isActive;

    await user.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated"
        : "User deactivated",
    });

  } catch (error) {

    console.log(
      "updateUserStatus",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};