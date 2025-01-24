import mongoose from "mongoose";

// Destructure Schema from mongoose
const { Schema } = mongoose;

// Define the schema for order items

// Define the main schema for the Order
const orderSchema = new Schema(
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
const Order = mongoose.model("Order", orderSchema);

export default Order;
