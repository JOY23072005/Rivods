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

        role: "user",
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
// for admins
export const updateUserRole = async (req, res) => {
  try {
    await connectDB();

    const { role } = req.body;

    if (!["admin", "sub-admin", "user"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
    });

  } catch (error) {
    console.log("updateUserRole", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// for sub-admins & admins
export const assignOrganizationAdmin = async (
  req,
  res
) => {
  try {
    await connectDB();

    const userId = req.params.userId;

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.role = "sub-admin";

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Organization admin assigned successfully",
    });

  } catch (error) {

    console.log(
      "assignOrganizationAdmin",
      error
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