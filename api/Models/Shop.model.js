import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: [{ type: String }],

  owner: { type: String, required: true },
  owneremail: { type: String, required: true },

  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  contact: {
    email: { type: String, required: true },
    phoneno: { type: Number, required: true },
  },
  location: {
    address: { type: String, required: true },
    mapurl: { type: [String], required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

const Shop = mongoose.model("shop", ShopSchema);

export default Shop;
