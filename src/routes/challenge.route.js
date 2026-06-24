import express from "express";

import {
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getActiveChallenges,
  getMyChallenges,
  claimChallengeReward,
} from "../controllers/challenge.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = express.Router();

router.post("/", protectRoute, authorize('admin','sub-admin'), createChallenge);

router.patch("/:challengeId", protectRoute, authorize('admin','sub-admin'), updateChallenge);

router.delete("/:challengeId", protectRoute, authorize('admin','sub-admin'), deleteChallenge);

router.get("/active", protectRoute, getActiveChallenges);

router.get("/my", protectRoute, getMyChallenges);

router.post(
  "/:challengeId/claim",
  protectRoute,
  claimChallengeReward
);

export default router;