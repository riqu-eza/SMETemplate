import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
    },
    count: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },

    ingridients: {
      type: [String],
      required: true,
    },
    howtouse: {
      type: [String],
      required: true,
    },
    imageUrls: {
      type: [],
      required: true,
    },
    ratings: {
      type: [Number], // Array of ratings
      default: [],
    },
    averageRating: {
      type: Number, // Calculated average rating
      default: 0,
    },
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
