import express from "express"
import {
  getRewards,
  createReward,
  updateReward,
  deleteReward,
  deactivateReward,
  activateReward,
  uploadRewardsCSV,
} from "../controllers/reward.controller.js";

import {protectRoute} from "../middleware/auth.middleware.js";

import {uploadCSV} from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getRewards);

router.post("/", protectRoute, createReward);

router.patch("/:rewardId", protectRoute, updateReward);

router.delete("/:rewardId", protectRoute, deleteReward);

router.patch(
  "/:rewardId/deactivate",
  protectRoute,
  deactivateReward
);

router.patch(
  "/:rewardId/activate",
  protectRoute,
  activateReward
);

router.post(
   "/upload-csv",
   protectRoute,
   uploadCSV,
   uploadRewardsCSV
);

export default router;