import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendVerificationEmail } from "../middlewares/email.js";
import UserModel from "../models/user.models.js";
import { generateAccessAndRefreshTokens } from "../utils/generateJwtTokens.js";
import { cookiesOptions } from "../constants.js";
import { sendPasswordResetEmail } from "../middlewares/sendPasswordResetEmail.js";
import { uploadOnCLoudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // extract details from request body
  const { name, email, phoneNumber, password } = req.body;

  // validations - all fileds are required
  if (
    [name, email, phoneNumber, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // get profile image local path
  let profileImageLocalPath;
  if (req?.file) {
    profileImageLocalPath = req?.file?.path;
  }

  // upload prfile image to cloudinary
  let profile;
  if (profileImageLocalPath) {
    try {
      profile = await uploadOnCLoudinary(profileImageLocalPath);
    } catch (error) {
      // log the error
      console.error("Error uploading file to cloudinary", error);
    }
  }

  // find user by email
  const user = await UserModel.findOne({ email });

  //  if user already exists & is verified
  if (user && user?.isVerified) {
    throw new ApiError(400, "User already exists with this email");
  }

  // generate 6 digits unique verificationCode
  const verificationCode = String(Date.now()).slice(-6);

  // if user already exists but not verified
  if (user && !user.isVerified) {
    // update user
    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // save updated user
    await user.save();

    // send verification email
    await sendVerificationEmail(email, verificationCode);

    // return the success response
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "User already exists but not verified. Please check your email for verification code"
        )
      );
  }

  try {
    // if user is registering for first time
    const newUser = new UserModel({
      name,
      email,
      phoneNumber,
      password,
      profile: profile?.secure_url,
      isVerified: false,
      verificationCode: verificationCode,
      verificationCodeExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // save new user
    await newUser.save();

    // send verification email
    await sendVerificationEmail(email, verificationCode);

    // find created user & remove password, refresh token,verificationCode, verificationCodeExpiry
    const createdUser = await UserModel.findById(newUser?._id).select(
      "-password -refreshToken -verificationCode -verificationCodeExpiry"
    );

    // return the success response
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          createdUser,
          "User registered successfully. Please check your email for verification code"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while registering user"
    );
  }
});

const verifyAccount = asyncHandler(async (req, res) => {
  // extract verification code from request body
  const { verificationCode } = req.body;

  // find user by verification code
  const user = await UserModel.findOne({ verificationCode }).select(
    "-password -refreshToken -verificationCode -verificationCodeExpiry"
  );

  // if user not found
  if (!user) {
    throw new ApiError(
      400,
      "Invalid verification code. Please enter correct verification code or sign up again to get new verification code"
    );
  }

  // if verification code is expired
  if (user.verificationCodeExpiry < Date.now()) {
    throw new ApiError(
      400,
      "Verification code is expired. Please sign up again to get new verification code"
    );
  }

  // update user to verified
  user.isVerified = true;
  user.verificationCode = "";
  user.verificationCodeExpiry = "";

  // save updated user
  await user.save();

  // return the success response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user,
        "User account verified successfully. Please login"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  // extract details from request body
  const { email, password } = req.body;

  // validations - all fileds are required
  if ([email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // find user by email
  const user = await UserModel.findOne({ email });

  // if user not found
  if (!user) {
    throw new ApiError(
      400,
      "User does not exists with this email. Please enter correct email or sign up"
    );
  }

  // if user is not verified
  if (!user.isVerified) {
    throw new ApiError(
      400,
      "User account is not verified yet. Please verify your email before login"
    );
  }

  // check if password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);

  // if password is not correct
  if (!isPasswordValid) {
    throw new ApiError(
      400,
      "Invalid Email or Password. Please try again with correct email and password"
    );
  }

  // generate access & refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // find logged in user & remove password, refresh token,verificationCode, verificationCodeExpiry
  const loggedInUser = await UserModel.findById(user._id).select(
    "-password -refreshToken -verificationCode -verificationCodeExpiry"
  );

  // return the success response
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, cookiesOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged in successfully."
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // find user by id & clear refresh token from db
  await UserModel.findByIdAndUpdate(
    req?.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  // clear the cookies & return the success response
  return res
    .status(200)
    .clearCookie("accessToken", cookiesOptions)
    .clearCookie("refreshToken", cookiesOptions)
    .json(new ApiResponse(200, {}, "Logged Out Successfully"));
});

// generate forgot password token & send email
const forgotPasswordRequest = asyncHandler(async (req, res) => {
  // extract email from request body
  const { email } = req.body;

  // validations - email is required
  if (email?.trim() === "") {
    throw new ApiError(400, "Registered email is required");
  }

  // find user by email
  const user = await UserModel.findOne({ email });

  // if user not found
  if (!user) {
    throw new ApiError(
      400,
      "User does not exists with this email. Please enter correct email or sign up"
    );
  }

  // generate 6 digits unique verificationCode
  const forgotPasswordToken = String(Date.now()).slice(-6);

  // update user forgotPasswordToken
  user.forgotPasswordToken = forgotPasswordToken;
  // set new forgot Password Token Expiry
  user.forgotPasswordTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  // save updated user
  await user.save({ validateBeforeSave: false });

  // send forgot password email
  await sendPasswordResetEmail(email, forgotPasswordToken);

  // return the success response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset token sent successfully. Please check your email"
      )
    );
});

// verify token & reset password
const resetPassword = asyncHandler(async (req, res) => {
  // extract details from request body
  const { email, forgotPasswordToken, newPassword, confirmNewPassword } =
    req.body;

  // validations - all fileds are required
  if (
    [email, forgotPasswordToken, newPassword, confirmNewPassword].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if newPassword & confirmNewPassword are same
  if (newPassword !== confirmNewPassword) {
    throw new ApiError(
      400,
      "New Password and Confirm New Password must be same"
    );
  }

  // find user by email
  const user = await UserModel.findOne({ email });

  // if user not found
  if (!user) {
    throw new ApiError(
      400,
      "User does not exists with this email. Please enter correct email or sign up"
    );
  }

  // check if user's current password & new password are same
  if (await user.isPasswordCorrect(newPassword)) {
    throw new ApiError(
      400,
      "New Password must be different from current password"
    );
  }

  // verify forgot password token
  if (user?.forgotPasswordToken !== forgotPasswordToken) {
    throw new ApiError(
      400,
      "Invalid forgot password token. Please try again with correct forgot password token"
    );
  }

  // check if forgot password token is expired
  if (user?.forgotPasswordTokenExpiry < Date.now()) {
    throw new ApiError(
      400,
      "Forgot password token is expired. Please request new forgot password token"
    );
  }

  // validate new password must be at least 8 characters long
  if (newPassword?.length < 8) {
    throw new ApiError(400, "New Password must be at least 8 characters long");
  }

  // update user password
  user.password = newPassword;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;

  // save updated user
  await user.save({ validateBeforeSave: false });

  // return the success response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

export {
  registerUser,
  verifyAccount,
  loginUser,
  logoutUser,
  forgotPasswordRequest,
  resetPassword,
};
