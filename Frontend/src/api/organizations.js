import axiosInstance from "./axios.js";
import { uploadImage } from "./helpers/upload.js";

/**
 * GET /organizations
 * @param {{
 *  page?: number,
 *  limit?: number,
 *  search?: string,
 *  isActive?: boolean|string
 * }} params
 */
export const getOrganizations = async (params = {}) => {
  const {data} = await axiosInstance.get("/org", {
    params,
  });
  return data;
};

export const getOrganization = async (orgId) => {
  const { data } = await axiosInstance.get(
    `/org/${orgId}`
  );

  return data;
};

export const createOrganization = async (
  organization
) => {
  const { data } = await axiosInstance.post(
    "/org/create",
    organization
  );

  return data;
};

export const updateOrganization = async (
  orgId,
  organization
) => {
  const { data } = await axiosInstance.patch(
    `/org/${orgId}`,
    organization
  );

  return data;
};

export const uploadOrganizationLogo = (orgId, image) => 
  uploadImage(`/org/${orgId}/logo`, image);

export const toggleOrganizationStatus =
  async (orgId, isActive) => {

    const { data } =
      await axiosInstance.patch(
        `/org/${orgId}`,
        {
          isActive,
        }
      );

    return data;
  };