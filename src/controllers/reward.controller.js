import { connectDB } from "../lib/db.js";

import RewardCatalog from "../models/rewardCatalog.model.js";
import User from "../models/user.model.js";

import csv from "csv-parser";
import streamifier from "streamifier";

export const getRewards = async (req, res) => {
  try {
    await connectDB();

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const query = {
      organizationId: user.organizationId,
      isActive: true,
    };

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
      image,
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
      image,
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

export const deactivateReward = async (req, res) => {
  try {
    await connectDB();

    const { rewardId } = req.params;

    const reward = await RewardCatalog.findById(rewardId);

    if (!reward) {
      return res.status(404).json({
        message: "Reward not found",
      });
    }

    reward.isActive = false;

    await reward.save();

    return res.status(200).json({
      success: true,
      message: "Reward deactivated",
    });

  } catch (error) {
    console.log("deactivateReward error", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const activateReward = async (req, res) => {
  try {
    await connectDB();

    const { rewardId } = req.params;

    const reward = await RewardCatalog.findById(rewardId);

    if (!reward) {
      return res.status(404).json({
        message: "Reward not found",
      });
    }

    reward.isActive = true;

    await reward.save();

    return res.status(200).json({
      success: true,
      message: "Reward activated",
    });

  } catch (error) {
    console.log("activateReward error", error.message);

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