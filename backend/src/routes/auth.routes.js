import { Router } from "express";
import {
  forgotPasswordRequest,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  verifyAccount,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

// router config
const router = Router();

// register user route
router.route("/register").post(upload.single("profile"), registerUser);

// verify account route
router.route("/verify-account").post(verifyAccount);

// login user route
router.route("/login").post(loginUser);

// logout user
router.route("/logout").post(verifyJWT, logoutUser);

// forgot password request route
router.route("/forgot-password-request").post(forgotPasswordRequest);

// reset password route
router.route("/reset-password").post(resetPassword);

export default router;
