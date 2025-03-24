import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";

// app config
const app = express();

// cors config
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
// common middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// static files
app.use(express.static("public"));
// cookie parser
app.use(cookieParser());

// routes import
import healthcheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";

// routes declarations
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);

// error handler
app.use(errorHandler);

export { app };
