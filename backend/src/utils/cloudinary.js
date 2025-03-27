import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCLoudinary = async (localFilePath) => {
  try {
    // if local file path is not found
    if (!localFilePath) return null;

    // upload image on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // log the success
    console.log("Image uploaded on cloudinary successfully! ", response.url);

    // delete the file from server
    fs.unlinkSync(localFilePath);

    // return the response
    return response;
  } catch (error) {
    // log the error
    console.error("Error uploading file to cloudinary", error);

    // delete the file from server
    fs.unlinkSync(localFilePath);

    // return null
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    // delete image from cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    // log the success
    console.log("Image deleted from cloudinary successfully!", result.url);
  } catch (error) {
    // log the error
    console.error("Error deleting file from cloudinary", error);
  }
};

export { uploadOnCLoudinary, deleteFromCloudinary };
