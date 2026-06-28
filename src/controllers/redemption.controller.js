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

        if (!user)
            return res.status(404).json({
                message: "User not found",
            });

        const reward = await RewardCatalog.findById(rewardId);

        if (!reward || !reward.isActive)
            return res.status(404).json({
                message: "Reward not found",
            });

        if (user.rewardCoinsBalance < reward.coinCost)
            return res.status(400).json({
                message: "Insufficient coins",
            });

        const existing = await Redemption.findOne({
            userId,
            rewardId,
            status: "PENDING",
        });

        if (existing)
            return res.status(400).json({
                message: "Reward already awaiting claim",
            });

        const redemption = await Redemption.create({
            userId,
            organizationId: user.organizationId,
            rewardId,
            coinsUsed: reward.coinCost,
        });

        res.status(201).json({
            success: true,
            message: "Reward reserved successfully",
            data: redemption,
        });

    } catch (err) {
        res.status(500).json({
            message: "Server Error",
        });
    }
};

export const claimReward = async (req, res) => {
    try {
        await connectDB();

        const shopkeeperId = req.userId;

        // console.log(req.params.redemptionId)

        const redemption = await Redemption.findById(
            req.params.redemptionId
        );

        if (!redemption)
            return res.status(404).json({
                message: "Redemption not found",
            });

        if (redemption.status !== "PENDING")
            return res.status(400).json({
                message: "Already claimed",
            });

        const user = await User.findById(redemption.userId);

        if (!user)
            return res.status(404).json({
                message: "User not found",
            });

        if (user.rewardCoinsBalance < redemption.coinsUsed)
            return res.status(400).json({
                message: "User doesn't have enough coins anymore",
            });

        user.rewardCoinsBalance -= redemption.coinsUsed;
        user.totalRewardCoinsRedeemed += redemption.coinsUsed;

        await user.save();

        redemption.status = "CLAIMED";
        redemption.claimedBy = shopkeeperId;

        await redemption.save();

        res.status(200).json({
            success: true,
            message: "Reward claimed successfully",
            data: redemption,
        });

    } catch (err) {
        res.status(500).json({
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