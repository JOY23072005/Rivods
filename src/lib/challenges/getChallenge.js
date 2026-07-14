import Challenge from "../../models/challenge.model.js";

export const getChallenge = async (
  challengeId,
  organizationId
) => {
  const challenge = await Challenge.findById(challengeId);

  if (!challenge) {
    const error = new Error("Challenge not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    challenge.organizationId.toString() !==
    organizationId.toString()
  ) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  return challenge;
};