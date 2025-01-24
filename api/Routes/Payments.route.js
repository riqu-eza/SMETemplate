import express from "express";
import {  callipn, processPayment } from "../controllers/Payments.controller.js";

const router = express.Router();

router.post("/process", processPayment);
router.post("/ipn", callipn);
// router.post("/mpesa/callback", Mpesafall);

export default router;
