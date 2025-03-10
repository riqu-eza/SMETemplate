import mongoose from "mongoose";


// Define the main schema for the Order
const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId, // Reference to the User model
      ref: "User",
      // required: true,
    },
    items: { type: [], required: true }, // Array of products (order items)
    totalPrice: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

// Create and export the Order model

export default OrderSchema;
