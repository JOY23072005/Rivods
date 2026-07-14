import DailyStepLog from "../../models/dailyStepLog.model.js";

export const calculateChallengeProgress = async (
  challenge,
  progress
) => {

  const joinDate =
    progress.joinedAt
      .toISOString()
      .split("T")[0];

  const endDate =
    challenge.endDate
      .toISOString()
      .split("T")[0];

  const logs = await DailyStepLog.find({
    userId: progress.userId,
    date: {
      $gte: joinDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });

  let currentValue = 0;

  for (const log of logs) {

    // First day user joined
    if (log.date === joinDate) {

      currentValue += Math.max(
        0,
        log.steps - progress.startingSteps
      );

    } else {

      // Every following day
      currentValue += log.steps;

    }
  }

  return {

    currentValue,

    isCompleted:
      currentValue >= challenge.goalValue,

    completedAt:
      currentValue >= challenge.goalValue
        ? new Date()
        : null,

  };

};