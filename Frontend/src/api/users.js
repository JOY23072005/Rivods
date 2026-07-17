import axiosInstance from "./axios.js";
import { uploadImage } from "./helpers/upload.js";

/**
 * GET
 * Users of my organization
 */
export const getUsers = async (params = {}) => {
  const { data } = await axiosInstance.get(
    "/manage-users",
    { params }
  );

  return data;
};

/**
 * GET
 * Users of Rivods
 */
export const getAllUsers = async (params = {}) => {
  const { data } = await axiosInstance.get(
    "/manage-users/all",
    { params }
  );

  return data;
};

/**
 * POST
 * Create user
 */
export const createUser = async (
  user
) => {
  const { data } =
    await axiosInstance.post(
      "/manage-users/create",
      user
    );

  return data;
};

/**
 * PATCH
 * Update user role
 */
export const updateUserRole =
  async (userId, role) => {

    const { data } =
      await axiosInstance.patch(
        `/manage-users/${userId}/role`,
        {
          role,
        }
      );

    return data;
  };

/**
 * PATCH
 * Activate / Deactivate user
 */
export const updateUserStatus =
  async (
    userId,
    isActive
  ) => {

    const { data } =
      await axiosInstance.patch(
        `/manage-users/${userId}/status`,
        {
          isActive,
        }
      );

    return data;
  };

  /**
 * PATCH
 * Update user details
 */
export const updateUser = async (
  userId,
  user
) => {
  const { data } =
    await axiosInstance.patch(
      `/manage-users/${userId}`,
      user
    );

  return data;
};

/**
 * PATCH
 * Update user profile image
 */
export const updateUserProfileImage = (userId, image) =>
  uploadImage(`/manage-users/${userId}/image`, image);