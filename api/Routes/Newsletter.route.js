import express from "express";
import { CreateNewsletter } from "../controllers/newsletter.controller.js";


const router = express.Router();

router.post("/create", CreateNewsletter)

export default router;