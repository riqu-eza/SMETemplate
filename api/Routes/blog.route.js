import express from "express";
import { createblog, getblog } from "../controllers/blog.controller.js";

const router = express.Router();

router.post("/create", createblog)
router.get("/getall", getblog )
export default router;