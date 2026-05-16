import express from "express";

import {protectRoute} from "../middleware/auth.middleware.js";

import {
  syncSteps,
  getTodaySteps,
  getStepHistory,
} from "../controllers/step.controller.js";

const router = express.Router();

router.post(
  "/sync",
  protectRoute,
  syncSteps
);

router.get(
  "/today",
  protectRoute,
  getTodaySteps
);

router.get(
  "/history",
  protectRoute,
  getStepHistory
);

export default router;