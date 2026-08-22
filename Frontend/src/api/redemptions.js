import axiosInstance from "./axios.js";

export const getAdminRedemptions = async (params) => {
  const response = await axiosInstance.get("/redeem/admin", { params });
  return response.data;
};

export const getRedemptionById = async (redemptionId) => {
  const response = await axiosInstance.get(`/redeem/admin/${redemptionId}`);
  return response.data;
};

export const claimReward = async (redemptionId) => {
  const response = await axiosInstance.post(`/redeem/claim/${redemptionId}`);
  return response.data;
};