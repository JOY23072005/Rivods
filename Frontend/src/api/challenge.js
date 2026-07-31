import axiosInstance from "./axios";

/**
 * GET
 * Fetch challenges (Admin / Organization Admin)
 */
export const getChallenges = async ({
  page = 1,
  limit = 10,
  search = "",
  challengeType = "",
  isActive,
  organizationId = "",
} = {}) => {
  const params = {
    page,
    limit,
  };

  if (search) {
    params.search = search;
  }

  if (challengeType) {
    params.challengeType = challengeType;
  }

  if (organizationId) {
    params.organizationId =
      organizationId;
  }

  if (
    typeof isActive === "boolean"
  ) {
    params.isActive = isActive;
  }

  const { data } =
    await axiosInstance.get(
      "/challenges/admin",
      { params }
    );

  return data;
};

/**
 * POST
 * Create Challenge
 */
export const createChallenge =
  async (challenge) => {
    const { data } =
      await axiosInstance.post(
        "/challenges",
        challenge
      );

    return data;
  };

/**
 * PATCH
 * Update Challenge
 */
export const updateChallenge =
  async (
    challengeId,
    challenge
  ) => {
    const { data } =
      await axiosInstance.patch(
        `/challenges/${challengeId}`,
        challenge
      );

    return data;
  };

/**
 * DELETE
 * Soft Delete Challenge
 */
export const deleteChallenge =
  async (challengeId) => {
    const { data } =
      await axiosInstance.delete(
        `/challenges/${challengeId}`
      );

    return data;
  };