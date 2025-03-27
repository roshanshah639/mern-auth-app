import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMessage, sendMessage } from "../controllers/message.controller.js";

// router config
const router = Router();

// send message
router.route("/send").post(verifyJWT, sendMessage);

// get message
router.route("/get-message").post(verifyJWT, getMessage);

export default router;
