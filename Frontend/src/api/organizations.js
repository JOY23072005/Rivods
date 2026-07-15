import axiosInstance from "./axios.js";

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
    "/org",
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

export const uploadOrganizationLogo = async (
  orgId,
  file
) => {
  const formData = new FormData();

  formData.append("image", file);

  const { data } =
    await axiosInstance.patch(
      `/org/${orgId}/logo`,
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return data;
};

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