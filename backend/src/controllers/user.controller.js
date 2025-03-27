import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import UserModel from "../models/user.models.js";

const getUsers = asyncHandler(async (req, res) => {
  // fins users
  const users = await UserModel.find();

  // if users not found
  if (!users) {
    throw new ApiError(404, "Users not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

export { getUsers };
