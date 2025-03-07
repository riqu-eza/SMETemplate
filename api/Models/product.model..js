import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  specifications: { type: String, required: false },
  Type: { type: String, required: false },
  pricingType: {
    type: String,
    enum: ["Fixed", "Variable", "Negotiable"],
    default: "Fixed",
    required: true,
  },
  hasOffers: { type: Boolean, default: false },
  discounts: { type: String, default: "" },
  variants: [
    {
      size: { type: String },
      stock: { type: Number, default: 0 },
    },
  ],
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  imageUrls: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export default ProductSchema;
