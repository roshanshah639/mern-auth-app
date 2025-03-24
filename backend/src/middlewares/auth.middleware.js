import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import UserModel from "../models/user.models.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
  // extract accessToken from cookies or request header
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  // if token not found
  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    // decode/verfiy access token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // find user by id
    const user = await UserModel.findById(decodedToken?._id);

    // if user is not found
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    // attach user to request object
    req.user = user;

    // call next middleware
    next();
  } catch (error) {
    throw new ApiError(
      401,
      "Something went wrong while verifying access token"
    );
  }
});

export { verifyJWT };
