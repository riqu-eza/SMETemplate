import Category from "../Models/Cateogry.model.js";
import Listing from "../Models/Listing.model.js";
import Product from "../Models/product.model..js";
import Shop from "../Models/Shop.model.js";

export const createListing = async (req, res, next) => {
  console.log(req.body);
  try {
    const listing = await Listing.create(req.body);
    console.log("saved", listing);
    return res.status(200).json(listing);
  } catch (e) {
    next(e);
  }
};

export const getListing = async (req, res, next) => {
  try {
    // Fetch all shops and populate their categories and products
    const listing = await Shop.find()
      .populate({
        path: 'categories', // Populate categories
        model: Category,
        populate: {
          path: 'products', // Populate products within each category
          model: Product,
        },
      });

    res.status(200).json(listing);
  } catch (error) {
    console.error('Error fetching shop listings:', error.message);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the shop listings.',
    });
  }
};




export const getProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    console.log(productId);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const categoryName = req.params.categoryName.trim();
    console.log("Fetching listings for category:", categoryName);

    const listings = await Listing.find({ category: categoryName });

    if (!listings.length) {
      return res
        .status(404)
        .json({ message: "No listings found for this category" });
    }

    return res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const addRating = async (req, res) => {
  try {
    const { productId, rating } = req.body;

    // Validate rating input
    if (!productId || rating == null) {
      return res.status(400).json({ message: "Product ID and rating are required." });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Find the product by ID
    const product = await Listing.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Update ratings and recalculate average
    product.ratings.push(rating);
    const totalRatings = product.ratings.length;
    const sumOfRatings = product.ratings.reduce((sum, value) => sum + value, 0);
    product.averageRating = sumOfRatings / totalRatings;

    // Save the updated product
    await product.save();

    res.status(200).json({
      message: "Rating added successfully.",
      productId: product._id,
      averageRating: product.averageRating,
      totalRatings: product.ratings.length,
    });
  } catch (error) {
    console.error("Error adding rating:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateListing = async () =>{
  try {
    const updatedProduct = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export const deleteListing = async () =>{
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}