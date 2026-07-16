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

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.max(
      parseInt(req.query.limit) || 10,
      1
    );

    const search =
      req.query.search?.trim() || "";

    const role =
      req.query.role?.trim();

    const isActive =
      req.query.isActive;

    const query = {
      organizationId:
        req.user.organizationId,
    };

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          employeeId: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (
      isActive === "true" ||
      isActive === "false"
    ) {
      query.isActive =
        isActive === "true";
    }

    const totalUsers =
      await User.countDocuments(
        query
      );

    const users =
      await User.find(query)
        .select("-password")
        .sort({
          createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit);

    const totalPages =
      Math.ceil(
        totalUsers / limit
      );

    return res.status(200).json({
      success: true,

      users,

      pagination: {
        page,
        limit,
        totalItems:
          totalUsers,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPrevPage:
          page > 1,
      },
    });

  } catch (error) {

    console.log(
      "getUsersOfOrganization:",
      error.message
    );

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

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.max(
      parseInt(req.query.limit) || 10,
      1
    );

    const search =
      req.query.search?.trim() || "";

    const role =
      req.query.role?.trim();

    const isActive =
      req.query.isActive;

    const query = {};

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          employeeId: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (
      isActive === "true" ||
      isActive === "false"
    ) {
      query.isActive =
        isActive === "true";
    }

    const totalUsers =
      await User.countDocuments(
        query
      );

    const users =
      await User.find(query)
        .select("-password")
        .sort({
          createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit);

    const totalPages =
      Math.ceil(
        totalUsers / limit
      );

    return res.status(200).json({
      success: true,

      users,

      pagination: {
        page,
        limit,
        totalItems:
          totalUsers,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPrevPage:
          page > 1,
      },
    });

  } catch (error) {

    console.log(
      "getUsersOfOrganization:",
      error.message
    );

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

export const updateUser = async (req, res) => {
  try {
    await connectDB();

    const { userId } = req.params;

    const {
      name,
      phone,
      gender,
      dob,
      employeeId,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Organization Admin can only edit users in their own organization
    if (
      req.user.role === "sub-admin" &&
      user.organizationId.toString() !==
        req.user.organizationId.toString()
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // Optional phone uniqueness check
    if (phone && phone !== user.phone) {
      const existingPhone =
        await User.findOne({
          organizationId: user.organizationId,
          phone,
          _id: { $ne: user._id },
        });

      if (existingPhone) {
        return res.status(400).json({
          message:
            "Phone number already exists",
        });
      }
    }

    if (name !== undefined)
      user.name = name.trim();

    if (phone !== undefined)
      user.phone = phone.trim();

    if (gender !== undefined)
      user.gender = gender;

    if (dob !== undefined)
      user.dob = dob;

    if (employeeId !== undefined)
      user.employeeId = employeeId;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: {
        userid: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        employeeId: user.employeeId,
        role: user.role,
        isActive: user.isActive,
      },
    });

  } catch (error) {

    console.log(
      "updateUser:",
      error.message
    );

    return res.status(500).json({
      message: "Internal server error",
    });

  }
};