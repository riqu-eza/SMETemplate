import express from "express";
import { createBlog, getBlog, } from "../controllers/blog.controller.js";

const router = express.Router();

router.post("/create", createBlog)
router.get("/getall", getBlog )
export default router;