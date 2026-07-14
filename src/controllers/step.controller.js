import { connectDB } from "../lib/db.js";

import User from "../models/user.model.js";
import DailyStepLog from "../models/dailyStepLog.model.js";
import { updateChallengeProgress } from "../lib/challenges/updateChallengeProgress.js";

export const syncSteps = async (req, res) => {
  try {
    await connectDB();

    const userId = req.userId;

    const { steps } = req.body;

    if (steps === undefined || steps < 0) {
      return res.status(400).json({
        message: "Invalid steps",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let dailyLog = await DailyStepLog.findOne({
      userId,
      date: today,
    });

    if (!dailyLog) {
      // first sync today

      const earnedCoins = Math.floor(steps / process.env.REWARD_STEPS);

      dailyLog = await DailyStepLog.create({
        userId,
        organizationId: user.organizationId,
        date: today,
        steps,
        coinsEarned: earnedCoins,
      });

      user.totalSteps += steps;
      user.rewardCoinsBalance += earnedCoins;
      user.totalRewardCoinsEarned +=earnedCoins;

    } else {
      // update existing log

      if (steps < dailyLog.steps) {
        return res.status(400).json({
          message: "Steps cannot decrease",
        });
      }

      const extraSteps = steps - dailyLog.steps;

      const updatedCoins = Math.floor(steps / process.env.REWARD_STEPS);

      const extraCoins =
        updatedCoins - dailyLog.coinsEarned;

      dailyLog.steps = steps;
      dailyLog.coinsEarned = updatedCoins;

      await dailyLog.save();

      user.totalSteps += extraSteps;
      user.rewardCoinsBalance += extraCoins;
      user.totalRewardCoinsEarned += extraCoins;
    }

    // console.log("step sync called calling update Challenge");
    await updateChallengeProgress(userId);
    // console.log("Step Sync updated challenge steps");

    user.lastSyncedAt = new Date();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Steps synced successfully",
      totalSteps: user.totalSteps,
      rewardCoinsBalance: user.rewardCoinsBalance,
      totalRewardCoinsEarned: user.totalRewardCoinsEarned
    });

  } catch (error) {
    console.log("syncSteps error", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getTodaySteps = async (req, res) => {
  try {
    await connectDB();

    const userId = req.userId;

    const today = new Date().toISOString().split("T")[0];

    const log = await DailyStepLog.findOne({
      userId,
      date: today,
    });

    return res.status(200).json({
      success: true,
      data: log || null,
    });

  } catch (error) {
    console.log("getTodaySteps error", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getStepHistory = async (req, res) => {
  try {
    await connectDB();

    const userId = req.userId;

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 30;

    const skip = (page - 1) * limit;

    const logs = await DailyStepLog.find({
      userId,
    })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DailyStepLog.countDocuments({
      userId,
    });

    return res.status(200).json({
      success: true,

      currentPage: page,

      totalPages: Math.ceil(total / limit),

      totalRecords: total,

      data: logs,
    });

  } catch (error) {
    console.log(
      "getStepHistory error",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};