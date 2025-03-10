// models/index.js

import BlogSchema from "./blog.model.js";
import CategorySchema from "./Category.model.js";
import CheckoutSchema from "./checkout.model.js";
import ListingSchema from "./Listing.model.js";
import NewsletterSchema from "./newsletter.model.js";
import OrderSchema from "./Order.model.js";
import ProductSchema from "./product.model.js";
import ShopSchema from "./Shop.model.js";
import UserSchema from "./user.model.js";

/**
 * Registers (if necessary) and returns tenant-specific models
 * @param {mongoose.Connection} connection - The tenant-specific connection.
 * @returns {Object} An object containing the models.
 */
export const getModels = (connection) => {
  return {
    Shop: connection.models.Shop || connection.model("Shop", ShopSchema),
    Category: connection.models.Category || connection.model("Category", CategorySchema),
    Product: connection.models.Product || connection.model("Product", ProductSchema),
    Blog: connection.models.Blog || connection.model("Blog", BlogSchema),
    Checkout: connection.models.Checkout || connection.model("Checkout", CheckoutSchema),
    Listing: connection.models.Listing || connection.model("Listing", ListingSchema),
    Order: connection.models.Order || connection.model("Order", OrderSchema),
    Newsletter: connection.models.Newsletter || connection.model("Newsletter", NewsletterSchema),
    User: connection.models.User || connection.model("User", UserSchema),
  };
};
