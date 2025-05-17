import {v2 as cloudinary} from "cloudinary";
import { log } from "console";
import fs from "fs";


cloudinary.config({
  cloud_name:`${process.env.CLOUDINARY_CLOUD_NAME}`,
  api_key:`${process.env.CLOUDINARY_API_KEY}`,
  api_secret:`${process.env.CLOUDIANRY_API_SECRET}`,
})

const uploadOnCloudinary = async(localFilePath) => {
  try {
    if(!localFilePath) return null;
    const response = await cloudinary.uploader(localFilePath,{
      resource_type: "auto",
    });
    // File uploaded successfully. Log message.
    console.log("File Uploaded Successfully - ",response.url);    
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // Remove the temporary file if the upload failed
    return null;
  }
}

export { uploadOnCloudinary }