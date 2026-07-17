import { connectDB } from "../lib/db.js";
import Organization from "../models/organization.model.js";

import {
  uploadBufferToCloudinary,
  deleteCloudinaryImage,
} from "../lib/uploadImage.js";

export const createOrganization = async (req, res) => {
  try {
    await connectDB();

    const {
      name,
      code,
      category,
    } = req.body;

    if (!name || !code || !category) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingOrg =
      await Organization.findOne({
        code: code.toUpperCase(),
      });

    if (existingOrg) {
      return res.status(400).json({
        message: "Organization code already exists",
      });
    }

    const organization =
      await Organization.create({
        name,
        code: code.toUpperCase(),
        category,
        createdBy: req.user._id,
      });

    return res.status(201).json({
      success: true,
      message:
        "Organization created successfully",
      organization,
    });

  } catch (error) {
    console.log(
      "Error in createOrganization:",
      error.message
    );

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const updateOrganizationLogo = async (req,res)=>{
  try{
    await connectDB();

    if(!req.file){
      return res.status(400).json({
        message:"No image provided"
      });
    }

    const organization =
      await Organization.findById(
        req.params.orgId
      );

    if(!organization){
      return res.status(404).json({
        message:"Organization not found"
      });
    }

    await deleteCloudinaryImage(
      organization.logo?.publicId
    );

    const result =
      await uploadBufferToCloudinary(
        req.file.buffer,
        "rivods/organizations"
      );

    organization.logo = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    await organization.save();

    return res.status(200).json({
      success:true,
      imageurl: organization.logo.url,
    });

  }catch(error){
    console.log(error);

    return res.status(500).json({
      message:"Server Error"
    });
  }
};

export const getAllOrg = async (req, res) => {
  try {
    await connectDB();

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.max(
      parseInt(req.query.limit) || 10,
      1
    );

    const search =
      req.query.search?.trim() || "";

    const isActive =
      req.query.isActive;

    const query = {};

    // Search by organization name
    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Optional active filter
    if (
      isActive === "true" ||
      isActive === "false"
    ) {
      query.isActive =
        isActive === "true";
    }

    const totalOrganizations =
      await Organization.countDocuments(
        query
      );

    const organizations =
      await Organization.find(query)
        .sort({
          createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit);

    const formattedOrganizations =
      organizations.map((org) => ({
        orgid: org._id,
        name: org.name,
        code: org.code,
        image_url:
          org.logo?.url || null,
        category: org.category,
        isActive: org.isActive,
      }));
      const totalPages = Math.ceil(
          totalOrganizations /
            limit
        )

    return res.status(200).json({
      success: true,

      organizations:
        formattedOrganizations,

      pagination: {
        page,
        limit,
        totalItems:
          totalOrganizations,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {

    console.log(
      "Error in getAllOrg:",
      error.message
    );

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const getOrganizationById = async (req, res) => {
  try {
    await connectDB();

    const organization = await Organization.findById(
      req.params.orgId
    ).populate(
      "createdBy",
      "name email"
    );

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    return res.status(200).json({
      success: true,
      organization: {
        orgid: organization._id,
        name: organization.name,
        code: organization.code,
        category: organization.category,
        image_url: organization.logo?.url || null,
        isActive: organization.isActive,
        createdBy: organization.createdBy,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
    });

  } catch (error) {
    console.log(
      "Error in getOrganizationById:",
      error.message
    );

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const updateOrganization = async (
  req,
  res
) => {
  try {

    await connectDB();

    const organization =
      await Organization.findById(
        req.params.orgId
      );

    if (!organization) {
      return res.status(404).json({
        message:
          "Organization not found",
      });
    }

    const {
      name,
      category,
      isActive,
    } = req.body;

    if (name)
      organization.name = name;

    if (category)
      organization.category =
        category;

    if (
      typeof isActive === "boolean"
    ) {
      organization.isActive =
        isActive;
    }

    await organization.save();

    return res.status(200).json({
      success: true,
      message:
        "Organization updated successfully",
      organization,
    });

  } catch (error) {

    console.log(
      "Error in updateOrganization:",
      error.message
    );

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const deleteOrganization = async (
  req,
  res
) => {
  try {

    await connectDB();

    const organization =
      await Organization.findById(
        req.params.orgId
      );

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    if (!organization.isActive) {
      return res.status(400).json({
        message: "Organization already deleted",
      });
    }

    organization.isActive = false;

    await organization.save();

    return res.status(200).json({
      success: true,
      message:
        "Organization deleted successfully",
    });

  } catch (error) {

    console.log(
      "Error in deleteOrganization:",
      error.message
    );

    return res.status(500).json({
      message: "Server Error",
    });
  }
};