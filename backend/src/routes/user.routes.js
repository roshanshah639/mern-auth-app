import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUsers } from "../controllers/user.controller.js";

// router config
const router = Router();

// register user route
router.route("/all-users").get(verifyJWT, getUsers);

export default router;
