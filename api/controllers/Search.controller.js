export const searchProducts = async (req, res) => {
  try {
    // Get the 'query' parameter from the request
    const { query } = req.query;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "A valid query parameter is required" });
    }

    // Define common stop words that should be removed from the query
    const commonWords = ["the", "of", "in", "a", "an", "and", "with", "for", "to", "on", "by", "at", "from"];

    // Split the query into individual words, lower-case them, and remove common words
    let keywords = query
      .split(" ")
      .map(word => word.trim().toLowerCase())
      .filter(word => word && !commonWords.includes(word));

    if (!keywords.length) {
      return res.status(400).json({ message: "Please provide more specific keywords." });
    }

    // Fetch tenant-specific models from req.models
    const { Product, Category } = req.models;

    // --- STEP 1: Find products where the product name matches any keyword ---
    const nameMatches = await Product.find({
      $or: keywords.map(keyword => ({
        name: { $regex: keyword, $options: "i" }
      }))
    });

    // --- STEP 2: Find products where the description matches any keyword,
    // excluding products already found in nameMatches ---
    const descriptionMatches = await Product.find({
      $and: [
        { _id: { $nin: nameMatches.map(p => p._id) } },
        {
          $or: keywords.map(keyword => ({
            description: { $regex: keyword, $options: "i" }
          }))
        }
      ]
    });

    // --- STEP 3: Find categories where the category name matches any keyword ---
    const matchingCategories = await Category.find({
      $or: keywords.map(keyword => ({
        name: { $regex: keyword, $options: "i" }
      }))
    });

    // From matching categories, fetch products that are not already in nameMatches or descriptionMatches
    let categoryProducts = [];
    if (matchingCategories.length > 0) {
      const categoryIds = matchingCategories.map(cat => cat._id);
      categoryProducts = await Product.find({
        categoryId: { $in: categoryIds },
        _id: { $nin: [...nameMatches, ...descriptionMatches].map(p => p._id) }
      });
    }

    // --- Combine results in order of priority ---
    // Priority 1: Products with a name match
    // Priority 2: Products belonging to a matching category
    // Priority 3: Products with a description match
    const combinedResults = [...nameMatches, ...categoryProducts, ...descriptionMatches];

    if (!combinedResults.length) {
      return res.status(404).json({ message: "No products found matching your search" });
    }

    res.status(200).json(combinedResults);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
