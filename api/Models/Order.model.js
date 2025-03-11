import mongoose from "mongoose";

const { Schema } = mongoose; // explicitly define Schema

const OrderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    items: { type: [], required: true },
    totalPrice: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

export default OrderSchema; // Export schema only
