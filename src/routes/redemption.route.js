import express from "express";

import {protectRoute} from "../middleware/auth.middleware.js";

import {
  claimReward,
  getMyRedemptions,
} from "../controllers/redemption.controller.js";

const router = express.Router();

router.post(
  "/claim/:rewardId",
  protectRoute,
  claimReward
);

router.get(
  "/my",
  protectRoute,
  getMyRedemptions
);

export default router;