import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "./../utils/ApiError.js";
import { ApiResponse } from "./../utils/ApiResponse.js";
import { User } from "./../models/user.models.js";
import { uploadOnCloudinary } from "./../utils/cloudinary.js";

const registerUser = asyncHandler(async (req,res)=>{
    // 1. Get user details from the frontend.
      const { fullName, email, password, username } = req.body;

    // 2. Check for validations based on ifEmpty, type etc.
      if(
        [fullName,email,password,username].some(field=>field.trim()==="")
      ){
        throw new ApiError(400,"All fields are required");
      }

    // 3. Check if the user is already present.
      const existingUser = await User.findOne({
        $or: [{username},{email}]
      })
      if(existingUser){
        res.status(409).json(new ApiError(409,"User Alrerady Exists",["User with this email or username already exists."]))
        // throw new ApiError(409,"User Alrerady Exists",["User with this email or username already exists."])
      }

    // 4. Check if the images, especially avatar is present.
      const avatarLocalPath = req.files?.avatar[0]?.path;
      if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is a required field.");
      }
      let coverImageLocalPath ;
      if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
      }
      
      // 5. Upload them to cloudinary.
      const avatar = await uploadOnCloudinary(avatarLocalPath);
      const coverImage = await uploadOnCloudinary(coverImageLocalPath);
      
      if(!avatar){
        throw new ApiError(400,"Avatar is required.");
      }
    
      // 6. Save the data to User table.
    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
    });
    
      // 7. Remove the password and refresh token from the response.
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // 8. Send the response back to the user.
    if(!createdUser){
      throw new ApiError(500,"Something went wrong while registering a User.")
    }

    return res.status(201).json(new ApiResponse(200,createdUser,"User Registered successfully."))
})

export { registerUser };
