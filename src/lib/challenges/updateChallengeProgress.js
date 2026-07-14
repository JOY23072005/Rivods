import ChallengeProgress from "../../models/challengeProgress.model.js";

import {
  calculateChallengeProgress,
} from "./calculateChallengeProgress.js";

export const updateChallengeProgress =
  async (userId) => {

    try {
      // console.log("Updating Challenge...");
      const progresses =
        await ChallengeProgress
          .find({
            userId,
          })
          .populate("challengeId");

      for (const progress of progresses) {

        const challenge =
          progress.challengeId;

        if (
          !challenge ||
          !challenge.isActive
        ) {
          continue;
        }

        const now =
          new Date();

        if (
          now > challenge.endDate
        ) {
          continue;
        }

        const result =
          await calculateChallengeProgress(
            challenge,
            progress
          );

        progress.currentValue =
          result.currentValue;

        progress.isCompleted =
          result.isCompleted;

        progress.completedAt =
          result.completedAt;

        progress.lastUpdatedAt =
          new Date();

        await progress.save();
      }

    } catch (error) {

      console.log(
        "updateChallengeProgress",
        error.message
      );
    }
  };