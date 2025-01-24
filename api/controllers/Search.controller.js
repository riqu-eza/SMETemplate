import Listing from "../Models/Listing.model.js";

export const searchProducts = async (req, res) => {
    const { query } = req.query; // Get the 'query' parameter from the request
  
    try {
      // Find products matching the search query (case-insensitive)
      const product = await Listing.find({
        name: { $regex: query, $options: 'i' } // Search for products by name
      });
  
      res.status(200).json(product); // Send the matching products as a response
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };