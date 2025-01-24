import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  specifications: { type: String, required: false },
  Type:{type: String, required: false},
  // Pricing Details
  pricingType: {
    type: String,
    enum: ["Fixed", "Variable", "Negotiable"], // Specify allowed values
    default: "Fixed",
    required: true,
  },
  hasOffers: { type: Boolean, default: false },
  discounts: {
    type: String, // E.g., "10% off", "Buy 1 Get 1 Free"
    default: "",
  },

  // Availability
  availabilityHours: {
    type: String, // E.g., "9 AM - 5 PM"
    required: false,
  },
  availabilityDays: {
    type: [String], // E.g., ["Monday", "Tuesday"]
    required: false,
  },
  variants: [
    {
      size: { type: String }, // E.g., "S", "M", "L", "XL"
      stock: { type: Number, default: 0 }, // Stock for the specific variant
    },
  ],

  // Relations
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  imageUrls: [{ type: String }],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
