import cloudinary from "./cloudinary.js";
import streamifier from "streamifier";

export const uploadBufferToCloudinary = (
  buffer,
  folder
) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier
      .createReadStream(buffer)
      .pipe(stream);
  });
};

export const deleteCloudinaryImage = async (
  publicId
) => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId);
};