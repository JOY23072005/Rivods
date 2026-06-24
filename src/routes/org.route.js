import express from "express";

import {
  createOrganization,
  getAllOrg,
  getOrganizationById,
  updateOrganization,
  updateOrganizationLogo,
  deleteOrganization,
} from "../controllers/org.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { uploadSingleImage } from "../middleware/upload.middleware.js";

const router = express.Router();

/*
  Public
*/
router.get("/", getAllOrg);

/*
  Admin only
*/
router.post(
  "/create",
  protectRoute,
  authorize("admin"),
  createOrganization
);

router.patch(
  "/:orgId/logo",
  protectRoute,
  authorize("admin"),
  uploadSingleImage,
  updateOrganizationLogo
);

router.get(
  "/:orgId",
  protectRoute,
  authorize("admin"),
  getOrganizationById
);

router.patch(
  "/:orgId",
  protectRoute,
  authorize("admin"),
  updateOrganization
);

router.delete(
  "/:orgId",
  protectRoute,
  authorize("admin"),
  deleteOrganization
);

export default router;