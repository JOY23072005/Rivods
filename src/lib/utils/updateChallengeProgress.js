import Challenge from "../../models/challenge.model.js";
import ChallengeProgress from "../../models/challengeProgress.model.js";
import DailyStepLog from "../../models/dailyStepLog.model.js";
import User from "../../models/user.model.js";

export const updateChallengeProgress = async (
  userId
) => {
  try {
    console.log("step sync called");
    const user =
      await User.findById(userId);

    if (!user) return;

    const now = new Date();

    const activeChallenges =
      await Challenge.find({
        organizationId:
          user.organizationId,

        isActive: true,

        startDate: {
          $lte: now,
        },

        endDate: {
          $gte: now,
        },
      });

    for (const challenge of activeChallenges) {

      const logs =
        await DailyStepLog.find({
          userId,

          createdAt: {
            $gte:
              challenge.startDate,

            $lte:
              challenge.endDate,
          },
        });

      const totalSteps =
        logs.reduce(
          (sum, log) =>
            sum + log.steps,
          0
        );

      let progress =
        await ChallengeProgress.findOne({
          challengeId:
            challenge._id,

          userId,
        });

      if (!progress) {

        progress =
          await ChallengeProgress.create({
            challengeId:
              challenge._id,

            userId,

            organizationId:
              user.organizationId,

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

      } else {

        progress.currentValue =
          totalSteps;

        if (
          !progress.isCompleted &&
          totalSteps >=
            challenge.goalValue
        ) {

          progress.isCompleted =
            true;

          progress.completedAt =
            new Date();
        }

        await progress.save();
      }
    }

  } catch (error) {

    console.log(
      "updateChallengeProgress",
      error.message
    );
  }
};