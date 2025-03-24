import { ApiError } from "../utils/ApiError.js";
import UserModel from "../models/user.models.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // find user by id
    const user = await UserModel.findById(userId);

    // if user not found
    if (!user) {
      throw new ApiError(400, "User not found");
    }

    // generate access & refresh tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // save refresh token to db
    user.refreshToken = refreshToken;

    // save updated user
    await user.save({ validateBeforeSave: false });

    // return the success response
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens. Please try again later"
    );
  }
};

export { generateAccessAndRefreshTokens };
