import express from "express";
import { createUser, getProfile, loginUser } from "../controllers/User.controller.js";
import { authenticateToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/signup", createUser);
router.post("/signin", loginUser);
router.get("/profile", authenticateToken, getProfile);

export default router;