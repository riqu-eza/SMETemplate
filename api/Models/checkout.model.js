// models/Order.js
import mongoose from "mongoose";

// Destructure Schema from mongoose
const { Schema } = mongoose;

const CheckoutSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    // orderItems: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Listing',  // Assuming you have another model named 'Listing' for the items
    //   required: true,
    // }],
    totalPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    discountCode: {
      type: String,
      default: "",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Order model
      ref: "Order",
      required: true
      // unique: true,
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed, // Allows any type of data
      required: true,
    },
  },
  {
    timestamps: true, // This will automatically add `createdAt` and `updatedAt` fields
  }
);

const Checkout = mongoose.model("checkout", CheckoutSchema);

export default Checkout;
