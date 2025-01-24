import express from "express";
import { checkout, createCheckout, createOrder, getorder } from "../controllers/Order.controller.js";

const router  = express.Router();

router.post("/create", createOrder );
router.get("/getorder/:orderId", getorder);
router.post('/checkout',createCheckout );
router.get("/getall", checkout)

export default router;