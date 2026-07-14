import axiosInstance from "./api.js";

/**
 * POST /auth/login
 * @param {{ email: string, password: string, orgid: string }} credentials
 */
export const login = (credentials) => {
  return axiosInstance.post("/auth/login", credentials);
};

/**
 * POST /auth/request-otp
 * @param {{ email: string, orgid: string, purpose: string }} data
 */
export const requestOtp = (data) => {
  return axiosInstance.post("/auth/request-otp", data);
};

/**
 * POST /auth/verify-otp
 * @param {{ email: string, orgid: string, otp: string, purpose: string }} data
 */
export const verifyOtp = (data) => {
  return axiosInstance.post("/auth/verify-otp", data);
};