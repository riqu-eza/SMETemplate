import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrls: [{ type: String }],
  promotionalimages:[{type:String}],
  owner: { type: String, required: true },
  owneremail: { type: String, required: true },
  companypolicy:{ type:String, requires: true},
  operationperiods: {
    type: Map,
    of: {
      open: { type: String, required: true },
      close: { type: String, required: true },
    },
  },
  
  socialmedialinks:[{type:String}],
  payonorder:{ type: Boolean, default: true },
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
