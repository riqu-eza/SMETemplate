import express from "express";
import { searchProducts } from "../controllers/Search.controller.js";

const router = express.Router();

router.get('/get', searchProducts );

export default router;