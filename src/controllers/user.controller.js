import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import streamifier from "streamifier";

export const updateProfile = async (req,res) => {
    const {name,email,phone,dob,gender,orgid,empid,roll} = req.body || {} ;
    try{
    await connectDB();
    let isEmailVerified = false;
    if(email){
        const emailOtp = await OTP.findOne({ identifier: email, verified: true });
        if (!emailOtp) {
            return res.status(400).json({
                message: "OTP not verified for email or phone",
            });
        }
        await OTP.deleteMany({ identifier: email });
        isEmailVerified=true;
    }

    let isPhoneVerified = false;
    if (phone) {
        const phoneOtp = await OTP.findOne({ identifier: phone, verified: true });
        if (!phoneOtp) {
            return res.status(400).json({
                message: "OTP not verified for new phone.",
            });
        }
        await OTP.deleteMany({ identifier: phone });
        isPhoneVerified = true;
    }

    const userId = req.userId;
    const updatedUser = await User.findById(userId).select("-password");
    if (!updatedUser) {
      return res.status(404).json({
          message: "User not found"
      });
    }
    if(name) updatedUser.name = name;
    if(email && isEmailVerified) updatedUser.email = email;
    if(phone && isPhoneVerified) updatedUser.phone = phone;
    if(roll) updatedUser.roll = roll;
    if(empid) updatedUser.employeeId = empid;
    if(orgid) updatedUser.organizationId = orgid;
    if(dob) updatedUser.dob = dob;
    if(gender) updatedUser.gender = gender;

    await updatedUser.save();
    
    return res.status(200).json({
        success:true,
        message:"Updated successfully",
    })
    } catch(error){
        console.log("error in updateProfile",error.message)
        return res.status(500).json({message:"Internal server error"});
    }
}
export const getDetails = async (req,res)=>{
    const userId = req.userId;
    try{
    await connectDB();
    const user = await User.findById(userId).select("-password -_id -__v");
    if(!user){
        return res.status(400).json({message:"User not found"});
    }
    return res.status(200).json(user)
    } catch(error) {
        console.log("error in getDetails ",error.message);
        return res.status(500).json({
            message:"Server error"
        })
    }
}

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    await connectDB();

    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old image if exists
    if (user.profileImage?.publicId) {
      await cloudinary.uploader.destroy(user.profileImage.publicId);
    }

    // Upload new image using stream
    const uploadFromBuffer = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "rivods/profile-images",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await uploadFromBuffer();

    // Save in DB
    user.profileImage = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      profileImage: user.profileImage.url,
    });

  } catch (error) {
    console.error("uploadProfileImage error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
