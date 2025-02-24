import express from "express";
import {
  addRating,
  createListing,
  deleteListing,
  getCategory,
  getListing,
  getProduct,
  getProducts,
  updateListing,
} from "../controllers/Listing.controller.js";

const router = express.Router();

router.post("/create", createListing);
router.post("/saverating", addRating);
router.get("/getlisting", getListing);
router.get("/products/:id", getProduct);
router.get("/products", getProducts);

router.get("/category/:categoryName", getCategory);
router.put("/gellisting:id", updateListing);
router.delete("/gellisting:id", deleteListing);

export default router;
