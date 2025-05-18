import { ApiError } from "./../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async(req,_,next)=>{
try {
  //   1. Accept the accessToken from the authorization header or cookie.
      const token = req.cookies?.accessToken || req.headers("Authorization").replace("Bearer ","");
  
  //    1.a. Check if the token exists
      if(!token){
        throw new ApiError(400,"Access Token missing");
      }
  
  //    1.b. Decode the token using jwt
      const decodedToken = jwt.decode(token,process.env.ACCESS_TOKEN_SECRET);
  
  //   2. Check if the user with the user_id exists in the DB.
      const user = await User.findOne(decodedToken?._id).select("-password -refreshToken");
      
  //   3. if(user does not exist)
  //       3.a. Return an error "Invalid Access Token".
      if(!user){
        throw new ApiError(403, "Invalid Token")
      }
  //     else{
  //       3.b. Check if the token is expired. 
  //         next (Step 4)
            // TODO: Check for token expiry and return error on expiry
  //     }
  //   4. if(token expired){
  //       4.a. Return error "Token expired".
  //     }else{
  //       4.b. Attach the details to request
      req.user = user;
  //     }
  //   5. Next Step to Controller
      next();
} catch (error) {
  throw new ApiError(401, error?.message || "Invalid Access Token");
}
});

export { verifyJWT };