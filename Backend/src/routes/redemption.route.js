import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

import {
  claimReward,
  createRedemption,
  getMyRedemptions,
  getAdminRedemptions,
  getRedemptionById,
} from "../controllers/redemption.controller.js";

const router = express.Router();

// User creates redemption
router.post(
  "/create/:rewardId",
  protectRoute,
  createRedemption
);

// Admin/staff claims redemption
router.post(
  "/claim/:redemptionId",
  protectRoute,
  authorize("admin", "sub-admin", "staff"),
  claimReward
);

// User's own redemption history
router.get(
  "/my",
  protectRoute,
  getMyRedemptions
);

// Admin panel redemption list
router.get(
  "/admin",
  protectRoute,
  authorize("admin", "sub-admin", "staff"),
  getAdminRedemptions
);

// Admin panel redemption details
router.get(
  "/admin/:redemptionId",
  protectRoute,
  authorize("admin", "sub-admin", "staff"),
  getRedemptionById
);

export default router;