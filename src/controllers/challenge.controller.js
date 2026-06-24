import { connectDB } from "../lib/db.js";

import Challenge from "../models/challenge.model.js";
import ChallengeProgress from "../models/challengeProgress.model.js";
import DailyStepLog from "../models/dailyStepLog.model.js";
import User from "../models/user.model.js";

export const createChallenge = async (req, res) => {
  try {
    await connectDB();

    const {
      title,
      description,
      challengeType,
      goalValue,
      rewardCoins,
      startDate,
      endDate,
    } = req.body;

    if (
      !title ||
      !goalValue ||
      !rewardCoins ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const challenge = await Challenge.create({
      organizationId: req.user.organizationId,

      title,
      description,

      challengeType:
        challengeType || "daily",

      goalValue,
      rewardCoins,

      startDate,
      endDate,

      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      challenge,
    });

  } catch (error) {

    console.log(
      "createChallenge",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateChallenge = async (
  req,
  res
) => {
  try {

    await connectDB();

    const challenge =
      await Challenge.findById(
        req.params.challengeId
      );

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found",
      });
    }

    if (
      challenge.organizationId.toString() !==
      req.user.organizationId.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const {
      title,
      description,
      challengeType,
      goalValue,
      rewardCoins,
      startDate,
      endDate,
      isActive,
    } = req.body;

    if (title) challenge.title = title;

    if (description)
      challenge.description = description;

    if (challengeType)
      challenge.challengeType =
        challengeType;

    if (goalValue)
      challenge.goalValue =
        goalValue;

    if (rewardCoins)
      challenge.rewardCoins =
        rewardCoins;

    if (startDate)
      challenge.startDate =
        startDate;

    if (endDate)
      challenge.endDate =
        endDate;

    if (
      typeof isActive ===
      "boolean"
    ) {
      challenge.isActive =
        isActive;
    }

    await challenge.save();

    return res.status(200).json({
      success: true,
      challenge,
    });

  } catch (error) {

    console.log(
      "updateChallenge",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteChallenge = async (
  req,
  res
) => {
  try {

    await connectDB();

    const challenge =
      await Challenge.findById(
        req.params.challengeId
      );

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found",
      });
    }

    challenge.isActive = false;

    await challenge.save();

    return res.status(200).json({
      success: true,
      message:
        "Challenge deleted successfully",
    });

  } catch (error) {

    console.log(
      "deleteChallenge",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getActiveChallenges =
  async (req, res) => {

    try {

      await connectDB();

      const today =
        new Date();

      const challenges =
        await Challenge.find({
          organizationId:
            req.user.organizationId,

          isActive: true,

          startDate: {
            $lte: today,
          },

          endDate: {
            $gte: today,
          },
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        challenges,
      });

    } catch (error) {

      console.log(
        "getActiveChallenges",
        error.message
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  };

  export const getMyChallenges =
  async (req, res) => {

    try {

      await connectDB();

      const challenges =
        await Challenge.find({
          organizationId:
            req.user.organizationId,

          isActive: true,
        }).sort({
          createdAt: -1,
        });

      const result = [];

      for (const challenge of challenges) {

        let progress =
          await ChallengeProgress.findOne({
            challengeId:
              challenge._id,

            userId:
              req.user._id,
          });

        if (!progress) {

          const stepLogs =
            await DailyStepLog.find({
              userId:
                req.user._id,

              createdAt: {
                $gte:
                  challenge.startDate,

                $lte:
                  challenge.endDate,
              },
            });

          const totalSteps =
            stepLogs.reduce(
              (sum, log) =>
                sum + log.steps,
              0
            );

          progress =
            await ChallengeProgress.create({
              challengeId:
                challenge._id,

              userId:
                req.user._id,

              organizationId:
                req.user.organizationId,

              currentValue:
                totalSteps,

              isCompleted:
                totalSteps >=
                challenge.goalValue,

              completedAt:
                totalSteps >=
                challenge.goalValue
                  ? new Date()
                  : null,
            });
        }

        result.push({
          challengeId:
            challenge._id,

          title:
            challenge.title,

          description:
            challenge.description,

          challengeType:
            challenge.challengeType,

          goalValue:
            challenge.goalValue,

          rewardCoins:
            challenge.rewardCoins,

          currentValue:
            progress.currentValue,

          progressPercentage:
            Math.min(
              100,
              Math.floor(
                (progress.currentValue /
                  challenge.goalValue) *
                  100
              )
            ),

          isCompleted:
            progress.isCompleted,

          rewardGranted:
            progress.rewardGranted,

          endDate:
            challenge.endDate,
        });
      }

      return res.status(200).json({
        success: true,
        challenges: result,
      });

    } catch (error) {

      console.log(
        "getMyChallenges",
        error.message
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  };

export const claimChallengeReward = async (
  req,
  res
) => {
  try {
    await connectDB();

    const challenge =
      await Challenge.findById(
        req.params.challengeId
      );

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found",
      });
    }

    const progress =
      await ChallengeProgress.findOne({
        challengeId: challenge._id,
        userId: req.userId,
      });

    if (!progress) {
      return res.status(404).json({
        message: "Progress not found",
      });
    }

    if (!progress.isCompleted) {
      return res.status(400).json({
        message:
          "Challenge not completed yet",
      });
    }

    if (progress.rewardGranted) {
      return res.status(400).json({
        message:
          "Reward already claimed",
      });
    }

    await User.findByIdAndUpdate(
      req.userId,
      {
        $inc: {
          rewardCoinsBalance:
            challenge.rewardCoins,

          totalRewardCoinsEarned:
            challenge.rewardCoins,
        },
      }
    );

    progress.rewardGranted = true;

    await progress.save();

    return res.status(200).json({
      success: true,
      rewardCoins:
        challenge.rewardCoins,

      message:
        "Reward claimed successfully",
    });

  } catch (error) {

    console.log(
      "claimChallengeReward",
      error
    );

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
};