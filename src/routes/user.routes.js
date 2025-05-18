import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "./../middlewares/auth.middleware.js";

const router = Router();

router.post("/register",upload.fields([
  {name:"avatar",maxCount:1},{name:"coverImage",maxCount:1}
]),registerUser);
router.post("/login",loginUser);

// ------ SECURE ROUTES -------
router.route("/logout").post(verifyJWT,logoutUser); // Another way of writing/injecting middleware


export default router;