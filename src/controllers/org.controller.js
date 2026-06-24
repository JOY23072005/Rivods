import { connectDB } from "../lib/db.js";
import Organization from "../models/organization.model.js";

import cloudinary from "../lib/cloudinary.js";
import streamifier from "streamifier";

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

    const uploadFromBuffer = () =>
      new Promise((resolve,reject)=>{
        const stream =
          cloudinary.uploader.upload_stream(
            {
              folder:"rivods/organizations"
            },
            (error,result)=>{
              if(error) reject(error);
              else resolve(result);
            }
          );

        streamifier
          .createReadStream(req.file.buffer)
          .pipe(stream);
      });

    if (organization.logo?.publicId) {
        await cloudinary.uploader.destroy(
            organization.logo.publicId
        );
    }

    const result = await uploadFromBuffer();

    organization.imageurl = result.secure_url;

    organization.logo = {
    url: result.secure_url,
    publicId: result.public_id,
    };

    await organization.save();

    return res.status(200).json({
      success:true,
      imageurl: organization.imageurl,
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

    const organizations =
      await Organization.find({
        isActive: true,
      });

    const formatOrgs =
      organizations.map((org) => ({
        orgid: org._id,
        name: org.name,
        image: org.imageurl,
        category: org.category,
      }));

    return res.status(200).json({
      success: true,
      organizations: formatOrgs,
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

export const getOrganizationById = async (
  req,
  res
) => {
  try {

    await connectDB();

    const organization =
      await Organization.findById(
        req.params.orgId
      ).populate(
        "adminId",
        "name email"
      );

    if (!organization) {
      return res.status(404).json({
        message:
          "Organization not found",
      });
    }

    return res.status(200).json({
      success: true,
      organization,
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