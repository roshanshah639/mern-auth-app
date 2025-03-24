import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Something went wrong";

  // Log the error for debugging (in development mode)
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  // Handle Mongoose CastError (invalid ID format)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ApiError(400, message);
  }

  // Handle Mongoose ValidationError (schema validation errors)
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    const message = `Validation failed: ${messages.join(". ")}`;
    err = new ApiError(400, message);
  }

  // Handle duplicate key errors (MongoDB E11000 error)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    err = new ApiError(400, message);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid JSON Web Token. Please try again.";
    err = new ApiError(401, message);
  }

  if (err.name === "TokenExpiredError") {
    const message = "JSON Web Token has expired. Please log in again.";
    err = new ApiError(401, message);
  }

  // Send the error response
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }), // Include stack trace in development
  });
};
