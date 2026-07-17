import express from "express"
import {
  getRewards,
  createReward,
  updateReward,
  deleteReward,
  uploadRewardsCSV,
  ToggleReward,
  getManageRewards,
  updateRewardImage,
} from "../controllers/reward.controller.js";

import {protectRoute} from "../middleware/auth.middleware.js";
import {authorize} from "../middleware/authorize.middleware.js"
import {uploadCSV, uploadSingleImage} from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getRewards);

router.post(
  "/",  
  protectRoute, 
  authorize('admin','sub-admin'),
  createReward
);

router.patch(
  "/:rewardId",  
  protectRoute, 
  authorize('admin','sub-admin'),
  updateReward);

router.delete("/:rewardId",  
  protectRoute, 
  authorize('admin','sub-admin'),
  deleteReward);

router.patch(
  "/:rewardId/toggle",
  protectRoute,
  authorize('admin','sub-admin'),
  ToggleReward
);

router.post(
   "/upload-csv",
   protectRoute,
   authorize('admin','sub-admin'),
   uploadCSV,
   uploadRewardsCSV
);

router.patch(
  "/:rewardId/image",
  protectRoute,
  authorize("admin", "sub-admin"),
  uploadSingleImage,
  updateRewardImage
);

router.get(
  "/manage",
  protectRoute,
  authorize("admin", "sub-admin"),
  getManageRewards
);

export default router;