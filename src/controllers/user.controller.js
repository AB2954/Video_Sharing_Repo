import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "./../utils/ApiError.js";
import { ApiResponse } from "./../utils/ApiResponse.js";
import { User } from "./../models/user.models.js";
import { uploadOnCloudinary } from "./../utils/cloudinary.js";
import jwt from "jsonwebtoken";

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
        // res.status(409).json(new ApiError(409,"User Alrerady Exists",["User with this email or username already exists."]))
        throw new ApiError(409, "User with this email or username already exists.")
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
});

const loginUser = asyncHandler(async(req,res,next)=>{
// 1. Get { username, email, password } from User/Frontend.
      const {username,email,password} = req.body;
      if(!username && !email){
        throw new ApiError(400,"Username or Email is required.")
      }
// 2. Check if the username exists.
      const user = await User.findOne({
        $or: [{username},{email}]
      }).select("-refreshToken");
      
//   if(username does not exist)
//     3.a. Return an error for "User not found".
      if(!user){
        throw new ApiError(404,"No user with provided username/email exists.")
      }
//   else
//     3.b. Check if the password hash matches the stored password.
//       next(step 4).
      // console.log("user===>",user)
    const isPasswordValid = user.isPasswordCorrect(password);

//   if(password does not match)
//     4.a. Return an error for "password did not match".
    if(!isPasswordValid){
      throw new ApiError(401,"Invalid User Credentials.");
    }
//   else
//     4.b. Generate accessToken & refreshToken using JWT.
//       next(step 5)
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

// 5. Send secure cookies and response.
    const cookieOptions = {
      httpOnly:true,
      secure: true
    }
    // -----Set password to undefined to remove from the user object.------
    user.password = undefined;
    res.status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json({
      user,
      accessToken,
      refreshToken
    });

// 6. Send Response with token to User/Frontend.
})

const logoutUser = asyncHandler(async(req,res,next)=>{
//    1. Find the user by id and update the refreshToken to undefined.
    const user = req.user;
    await User.findByIdAndUpdate(user._id,{
      $set: {
        refreshToken: undefined
      }
    });
    const cookieOptions = {
      httpOnly:true,
      secure: true
    }
//    2. Remove the cookie from the browser.
//    3. Send the response to user about logout.
    res.status(200)
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json({
      message: `User ${user.username} logged out successfully.`
    })
});

const renewAccessToken = asyncHandler(async(req,res)=>{
// 1. Receive refresh token form user (cookie/body).
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

// 2. Check if the token is present.
    if(!incomingRefreshToken){
      throw new ApiError(401,"Refresh token is required.");
    }
// 3. if(token not present)
//     3.a. return error "No token present."
//    else
//     3.b. Decode the token using jwt.
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

// 4. Get the user from db based on the id 
    const user = await User.findById(decodedToken?._id);

// 5. if(user not found)
//       return error "Invalid Token"
      if(!user){
        throw new ApiError(401, "Invalid Refresh Token");
      }

//6.  check incoming token with saved token.
//    6.a. if(token does not match)
//       return error "Token already expired or used."
      if(user?.refreshToken !== incomingRefreshToken){
        throw new ApiError(401,"Refresh Token expired.")
      }
//    else
//       generate a new access & refresh token.
      const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);
// 7. Send the refresh token back to user.
      const cookieOptions = {
        httpOnly: true,
        secure: true
      }
      return res.status(200)
      .cookie("accessToken",accessToken,cookieOptions)
      .cookie("refreshToken",refreshToken,cookieOptions)
      .json(new ApiResponse(200,{
        accessToken,
        refreshToken,
      },"AccessToken renewed."))
});

async function generateAccessAndRefreshTokens(userId){
  const user = await User.findById(userId);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.save({validateBeforeSave:false});

  return {accessToken,refreshToken};
}


export { 
  registerUser, 
  loginUser,
  logoutUser,
  renewAccessToken
};
