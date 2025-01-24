import express from "express";
import { ipnreat } from "../controllers/ipn.controller.js";

const router = express.Router();

router.post("/callbackurl", ipnreat);


export default router;
