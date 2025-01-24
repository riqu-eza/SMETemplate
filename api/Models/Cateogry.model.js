import mongoose from "mongoose";
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Products" }],
  createdAt: { type: Date, default: Date.now },
});

const Category = mongoose.model("Category", CategorySchema);

export default Category;
