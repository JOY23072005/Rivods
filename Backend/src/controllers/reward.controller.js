import { connectDB } from "../lib/db.js";

import RewardCatalog from "../models/rewardCatalog.model.js";
import User from "../models/user.model.js";

import csv from "csv-parser";
import streamifier from "streamifier";

import {
  uploadBufferToCloudinary,
  deleteCloudinaryImage,
} from "../lib/uploadImage.js";

export const updateRewardImage = async (
  req,
  res
) => {
  try {
    await connectDB();

    if (!req.file) {
      return res.status(400).json({
        message: "No image provided",
      });
    }

    const reward =
      await RewardCatalog.findById(
        req.params.rewardId
      );

    if (!reward) {
      return res.status(404).json({
        message: "Reward not found",
      });
    }

    // Organization Admin restriction
    if (
      req.user.role === "sub-admin" &&
      reward.organizationId.toString() !==
        req.user.organizationId.toString()
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await deleteCloudinaryImage(
      reward.image?.publicId
    );

    const result =
      await uploadBufferToCloudinary(
        req.file.buffer,
        "rivods/rewards"
      );

    reward.image = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    await reward.save();

    return res.status(200).json({
      success: true,
      message:
        "Reward image updated successfully",
      image_url: reward.image.url,
    });

  } catch (error) {

    console.log(
      "updateRewardImage:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });

  }
};

export const getRewards = async (req, res) => {
  try {
    await connectDB();

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.max(
      parseInt(req.query.limit) || 10,
      1
    );

    const skip = (page - 1) * limit;

    const search =
      req.query.search?.trim() || "";
    
    const query = {
      organizationId: user.organizationId,
      isActive: true,
    };

    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    const rewards = await RewardCatalog.find(query)
      .select(
        "title coinCost image isActive createdAt"
      )
      .sort({ coinCost: 1 })
      .skip(skip)
      .limit(limit);

    const totalRewards =
      await RewardCatalog.countDocuments(query);

    return res.status(200).json({
      success: true,

      currentPage: page,

      totalPages: Math.ceil(
        totalRewards / limit
      ),

      totalRewards,

      data: rewards,
    });

  } catch (error) {
    console.log(
      "getRewards error",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const createReward = async (req, res) => {
  try {
    await connectDB();

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const {
      title,
      coinCost,
    } = req.body;

    if (!title || !coinCost) {
      return res.status(400).json({
        message: "Missing fields",
      });
    }

    const reward = await RewardCatalog.create({
      organizationId: user.organizationId,
      title,
      coinCost,
    });

    return res.status(201).json({
      success: true,
      data: reward,
    });

  } catch (error) {
    console.log("createReward error", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateReward = async (req, res) => {
  try {
    await connectDB();

    const { rewardId } = req.params;

    const reward = await RewardCatalog.findById(rewardId);

    if (!reward) {
      return res.status(404).json({
        message: "Reward not found",
      });
    }

    Object.assign(reward, req.body);

    await reward.save();

    return res.status(200).json({
      success: true,
      data: reward,
    });

  } catch (error) {
    console.log("updateReward error", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const ToggleReward = async (req, res) => {
  try {
    await connectDB();

    const { rewardId } = req.params;
    const { isActive } = req.body;

    const reward = await RewardCatalog.findById(rewardId);

    if (!reward) {
      return res.status(404).json({
        message: "Reward not found",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be a boolean",
      });
    }

    reward.isActive = isActive;

    await reward.save();

    return res.status(200).json({
      success: true,
      message: isActive? "Reward activated" : "Reward deactivated",
    });

  } catch (error) {
    console.log("deactivateReward error", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteReward = async (req, res) => {
  try {
    await connectDB();

    const { rewardId } = req.params;

    const reward = await RewardCatalog.findById(rewardId);

    if (!reward) {
      return res.status(404).json({
        message: "Reward not found",
      });
    }

    await deleteCloudinaryImage(
      reward.image?.publicId
    );

    await reward.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Reward deleted permanently",
    });

  } catch (error) {
    console.log("deleteReward error", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const uploadRewardsCSV = async (req, res) => {
  try {
    await connectDB();
    if (!req.file) {
      return res.status(400).json({
        message: "CSV file is required",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const rewards = [];

    const stream = streamifier
      .createReadStream(req.file.buffer)
      .pipe(csv())
      .on("data", (row) => {
        rewards.push({
          organizationId: user.organizationId,

          title: row.title?.trim(),

          coinCost: Number(row.coinCost),

          image: {
            url: row.imageUrl || null,
            publicId: null,
          },

          isActive: true,
        });
      })
      .on("end", async () => {
        try {
          const validRewards = rewards.filter(
            (reward) =>
              reward.title &&
              !isNaN(reward.coinCost)
          );

          if (validRewards.length === 0) {
            return res.status(400).json({
              message: "No valid rewards found in CSV",
            });
          }

          await RewardCatalog.insertMany(validRewards);

          return res.status(201).json({
            success: true,
            message: `${validRewards.length} rewards uploaded successfully`,
          });

        } catch (error) {
          console.log("CSV insert error", error.message);

          return res.status(500).json({
            message: "CSV processing failed",
          });
        }
      });

  } catch (error) {
    console.log("uploadRewardsCSV error", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getManageRewards = async (req, res) => {
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

    const isActive =
      req.query.isActive;

    const query = {
      organizationId: req.user.organizationId,
    };

    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (
      isActive === "true" ||
      isActive === "false"
    ) {
      query.isActive =
        isActive === "true";
    }

    const totalRewards =
      await RewardCatalog.countDocuments(
        query
      );

    const rewards =
      await RewardCatalog.find(query)
        .sort({
          createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit);

    const formattedRewards =
      rewards.map((reward) => ({
        rewardId: reward._id,
        title: reward.title,
        coinCost: reward.coinCost,
        image_url:
          reward.image?.url || null,
        isActive:
          reward.isActive,
      }));

    const totalPages = Math.ceil(
      totalRewards / limit
    );

    return res.status(200).json({
      success: true,

      rewards:
        formattedRewards,

      pagination: {
        page,
        limit,
        totalItems:
          totalRewards,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPrevPage:
          page > 1,
      },
    });

  } catch (error) {

    console.log(
      "getManageRewards:",
      error.message
    );

    return res.status(500).json({
      message: "Server Error",
    });

  }
};