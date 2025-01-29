import express from "express";
import {
  addCategoryToShop,
  createItem,
  createproduct,
  createShop,
  deleteCategory,
  deleteproduct,
  fetchCategoriesForShop,
  getProductsBySubcategory,
  getShop,
  updateCategory,
  updateItem,
  updateShop,
} from "../controllers/Shop.controller.js";

const router = express.Router();

router.post("/product/create", createproduct);
router.post("/shop/create", createShop);
router.get("/shop/getall", getShop);
router.put("/shop/:shopId", updateShop);
router.post("/category/create", addCategoryToShop);
router.post("/producttype/create");
router.get("/shop/:shopId/categories", fetchCategoriesForShop);
router.get("/categories/:categoryId/products", getProductsBySubcategory);
router.post("/:type/:shopId", createItem);
router.put("/:type/:id/:shopId", updateItem);
router.delete("/products/:productId", deleteproduct);
router.delete("/categories/:categoryId", deleteCategory);
router.put("/categories/:categoryId", addCategoryToShop);

export default router;
