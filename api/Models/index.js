// models/index.js

import CategorySchema from "./Category.model.js";
import ProductSchema from "./product.model.js";
import ShopSchema from "./Shop.model.js";

/**
 * Registers (if necessary) and returns tenant-specific models
 * @param {mongoose.Connection} connection - The tenant-specific connection.
 * @returns {Object} An object containing the models.
 */
export const getModels = (connection) => {
  return {
    Shop: connection.models.Shop || connection.model("Shop", ShopSchema),
    Category:
      connection.models.Category || connection.model("Category", CategorySchema),
    Product:
      connection.models.Product || connection.model("Product", ProductSchema),
    // Add additional models here
  };
};
