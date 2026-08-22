import { connectDB } from "../lib/db.js";

import User from "../models/user.model.js";
import RewardCatalog from "../models/rewardCatalog.model.js";
import Redemption from "../models/redemption.model.js";

export const createRedemption = async (req, res) => {
  try {
    await connectDB();

    const userId = req.userId;
    const { rewardId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const reward = await RewardCatalog.findById(rewardId);

    if (!reward || !reward.isActive) {
      return res.status(404).json({
        message: "Reward not found",
      });
    }

    if (user.rewardCoinsBalance < reward.coinCost) {
      return res.status(400).json({
        message: "Insufficient coins",
      });
    }

    const existing = await Redemption.findOne({
      userId,
      rewardId,
      status: "PENDING",
    });

    if (existing) {
      return res.status(400).json({
        message: "Reward already awaiting claim",
      });
    }

    // Reserve coins immediately
    user.rewardCoinsBalance -= reward.coinCost;
    user.totalRewardCoinsRedeemed += reward.coinCost;

    await user.save();

    const redemption = await Redemption.create({
      userId,
      organizationId: user.organizationId,
      rewardId,
      coinsUsed: reward.coinCost,
    });

    return res.status(201).json({
      success: true,
      message: "Reward reserved successfully",
      data: redemption,
    });

  } catch (err) {
    console.error("createRedemption:", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const claimReward = async (req, res) => {
  try {
    await connectDB();

    const shopkeeperId = req.userId;

    const redemption = await Redemption.findById(
      req.params.redemptionId
    );

    if (!redemption) {
      return res.status(404).json({
        message: "Redemption not found",
      });
    }

    if (redemption.status !== "PENDING") {
      return res.status(400).json({
        message: "Reward already claimed",
      });
    }

    redemption.status = "CLAIMED";
    redemption.claimedBy = shopkeeperId;
    redemption.claimedAt = new Date();

    await redemption.save();

    return res.status(200).json({
      success: true,
      message: "Reward claimed successfully",
      data: redemption,
    });

  } catch (err) {
    console.error("claimReward:", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const getMyRedemptions = async (
  req,
  res
) => {
  try {
    await connectDB();

    const userId = req.userId;

    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const query = { userId };

    const redemptions =
      await Redemption.find(query)
        .populate(
          "rewardId",
          "title coinCost image"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total =
      await Redemption.countDocuments(
        query
      );

    return res.status(200).json({
      success: true,

      currentPage: page,

      totalPages: Math.ceil(
        total / limit
      ),

      totalRecords: total,

      data: redemptions,
    });

  } catch (error) {
    console.log(
      "getMyRedemptions error",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getAdminRedemptions = async (req, res) => {
  try {
    await connectDB();

    const page = Math.max(parseInt(req.query.page) || 1,1);

    const limit = Math.max(parseInt(req.query.limit) || 10,1);

    const search = req.query.search?.trim() || "";

    const status = req.query.status?.trim();

    const user = await User.findById(req.userId).select("role organizationId");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Organization isolation
    const query = {};

    if (user.role !== "admin") {
      query.organizationId = user.organizationId;
    }

    if (status) {
      query.status = status;
    }

    let redemptions = await Redemption.find(query)
      .populate({
        path: "userId",
        select: "name email phone employeeId",
      })
      .populate({
        path: "rewardId",
        select: "title coinCost image",
      })
      .populate({
        path: "claimedBy",
        select: "name email employeeId",
      })
      .populate({
        path: "organizationId",
        select: "name code",
      })
      .sort({ createdAt: -1 });

    // Search populated fields
    if (search) {
      const searchRegex = new RegExp(search, "i");

      redemptions = redemptions.filter((redemption) => {
        const user = redemption.userId;
        const reward = redemption.rewardId;

        return (
          searchRegex.test(user?.name || "") ||
          searchRegex.test(user?.email || "") ||
          searchRegex.test(user?.employeeId || "") ||
          searchRegex.test(reward?.title || "")
        );
      });
    }

    const totalItems = redemptions.length;

    const totalPages = Math.ceil(
      totalItems / limit
    );

    const startIndex =
      (page - 1) * limit;

    const paginatedRedemptions =
      redemptions.slice(
        startIndex,
        startIndex + limit
      );

    return res.status(200).json({
      success: true,
      redemptions: paginatedRedemptions,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPrevPage:
          page > 1,
      },
    });

  } catch (error) {
    console.log(
      "getAdminRedemptions:",
      error.message
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getRedemptionById = async (req, res) => {
  try {
    await connectDB();

    const user = await User.findById(req.userId).select("role organizationId");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const query = {
      _id: req.params.redemptionId,
    };

    // Non-platform admins can only access
    // their organization's redemption.
    if (user.role !== "admin") {
      query.organizationId =
        user.organizationId;
    }

    const redemption =
      await Redemption.findOne(query)
        .populate({
          path: "userId",
          select:
            "name email phone employeeId",
        })
        .populate({
          path: "rewardId",
          select:
            "title coinCost image",
        })
        .populate({
          path: "claimedBy",
          select:
            "name email employeeId",
        })
        .populate({
          path: "organizationId",
          select: "name code",
        });

    if (!redemption) {
      return res.status(404).json({
        message: "Redemption not found",
      });
    }

    return res.status(200).json({
      success: true,
      redemption,
    });

  } catch (error) {
    console.log(
      "getRedemptionById:",
      error.message
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};