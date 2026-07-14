import { connectDB } from "../lib/db.js";

import Challenge from "../models/challenge.model.js";
import ChallengeProgress from "../models/challengeProgress.model.js"
import User from "../models/user.model.js";

import { getChallenge } from "../lib/challenges/getChallenge.js";
import { getChallengeProgress } from "../lib/challenges/getChallengeProgress.js";
import { joinChallenge as joinChallengeHelper } from "../lib/challenges/joinChallenge.js";

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
      await getChallenge(
        req.params.challengeId,
        req.user.organizationId
      );

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

    return res.status(
      error.statusCode || 500
    ).json({
      message: error.message || "Internal server error",
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

      const joinedChallenges =
        await ChallengeProgress.find({
          userId: req.user._id,
        }).select("challengeId");

      const joinedIds =
        new Set(
          joinedChallenges.map(
            (item) =>
              item.challengeId.toString()
          )
        );

      const result =
        challenges.map(
          (challenge) => ({
            ...challenge.toObject(),

            joined:
              joinedIds.has(
                challenge._id.toString()
              ),
          })
        );

      return res.status(200).json({
        success: true,
        challenges: result,
      });

    } catch (error) {

      console.log(
        "getActiveChallenges",
        error.message
      );

      return res.status(
        error.statusCode || 500
      ).json({
        message: error.message || "Internal server error",
      });
    }
  };

export const joinChallenge = async (req, res) => {
  try {
    await connectDB();

    const { challengeId } = req.params;

    const challenge = await getChallenge(
        req.params.challengeId,
        req.user.organizationId
    );

    if (!challenge.isActive) {
      return res.status(400).json({
        message: "Challenge is not active",
      });
    }

    const today = new Date();

    if (
      today < challenge.startDate ||
      today > challenge.endDate
    ) {
      return res.status(400).json({
        message: "Challenge is not currently running",
      });
    }

    const progress=
      await joinChallengeHelper(
      challenge,
      req.user
    );

    return res.status(201).json({
      success: true,
      message:
        "Challenge joined successfully",
      progress,
    });

  } catch (error) {

    console.log(
      "joinChallenge",
      error.message
    );

    return res.status(
      error.statusCode || 500
    ).json({
      message: error.message || "Internal server error",
    });
  }
};

export const getChallengeById =
  async (req, res) => {

    try {

      await connectDB();

      const { challengeId } =
        req.params;

      const challenge=
        await getChallenge(
        req.params.challengeId,
        req.user.organizationId
      );

      const progress=
        await getChallengeProgress(
        challenge._id,
        req.user._id
      );

      if (!progress) {

        return res.status(200).json({
          success: true,

          joined: false,

          challenge: {
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

            startDate:
              challenge.startDate,

            endDate:
              challenge.endDate,

            isActive:
              challenge.isActive,
          },
        });
      }

      return res.status(200).json({
        success: true,

        joined: true,

        challenge: {
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

          startDate:
            challenge.startDate,

          endDate:
            challenge.endDate,

          isActive:
            challenge.isActive,

          joinedAt:
            progress.joinedAt,

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

          completedAt:
            progress.completedAt,

          rewardGranted:
            progress.rewardGranted,
        },
      });

    } catch (error) {

      console.log(
        "getChallengeById",
        error.message
      );

      return res.status(
        error.statusCode || 500
      ).json({
        message: error.message || "Internal server error",
      });
    }
  };

  export const claimChallengeReward = async (
  req,
  res
) => {
  try {

    await connectDB();

    const { challengeId } =
      req.params;

    const challenge = await getChallenge(
      req.params.challengeId,
      req.user.organizationId
    );

    const progress=
      await getChallengeProgress(
      challenge._id,
      req.user._id
    );

    if (!progress) {
      return res.status(400).json({
        message:
          "You have not joined this challenge",
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
      req.user._id,
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
      error.message
    );

    return res.status(
      error.statusCode || 500
    ).json({
      message: error.message || "Internal server error",
    });
  }
};