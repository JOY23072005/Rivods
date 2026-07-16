import express from "express";

import {
  createUser,
  updateUserRole,
  getUsers,
  getAllUsers,
  updateUserStatus,
} from "../controllers/userManagement.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = express.Router();

router.post(
  "/create",
  protectRoute,
  authorize(
    "admin",
    "sub-admin"
  ),
  createUser
);

router.patch(
  "/:userId/role",
  protectRoute,
  authorize("admin","sub-admin"),
  updateUserRole
);

router.get(
  "/",
  protectRoute,
  authorize(
    "admin",
    "sub-admin"
  ),
  getUsers
);

router.get(
  "/all",
  protectRoute,
  authorize("admin"),
  getAllUsers
);

router.patch(
  "/:userId/status",
  protectRoute,
  authorize("admin", "sub-admin"),
  updateUserStatus
);

export default router;