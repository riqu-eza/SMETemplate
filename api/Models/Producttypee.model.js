import mongoose from "mongoose";

const ProductTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const ProductType = mongoose.model('ProductType', ProductTypeSchema);

export default ProductType