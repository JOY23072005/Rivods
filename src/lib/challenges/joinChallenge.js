import ChallengeProgress from "../../models/challengeProgress.model.js";
import DailyStepLog from "../../models/dailyStepLog.model.js";

export const joinChallenge = async (
  challenge,
  user
) => {

  const alreadyJoined =
    await ChallengeProgress.findOne({
      challengeId: challenge._id,
      userId: user._id,
    });

  if (alreadyJoined) {
    const error = new Error(
      "Already joined this challenge"
    );

    error.statusCode = 400;

    throw error;
  }

  const today = new Date().toISOString().split("T")[0];

  const todayLog = await DailyStepLog.findOne({
    userId: user._id,
    date: today,
  });

  const startingSteps = todayLog?.steps || 0;

  const progress =
    await ChallengeProgress.create({
      challengeId: challenge._id,

      userId: user._id,

      organizationId:
        user.organizationId,

      joinedAt: new Date(),
      startingSteps,

      currentValue: 0,
    });

  return progress;
};