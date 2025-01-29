import Category from "../Models/Cateogry.model.js";
import Product from "../Models/product.model..js";
import Shop from "../Models/Shop.model.js";

export const fetchCategoriesForShop = async (req, res, next) => {
  const { shopId } = req.params;

  try {
    // Verify the shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Fetch all categories for the shop
    const categories = await Category.find({ shopId });

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories for shop:", error.message);
    next(error);
  }
};


export const createShop = async (req, res) => {
  try {
    const shop = new Shop(req.body);
    await shop.save();
    res.status(201).json(shop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getShop = async (req, res, next) => {
  try {
    const shops = await Shop.find(); // Fetch all shops from MongoDB
    res.status(200).json(shops); // Return the shops as JSON
  } catch (err) {
    console.error("Error fetching shops:", err.message); // Log the error for debugging
    next(err); // Pass the error to the error-handling middleware
  }
};

export const updateShop = async (req, res) => {
  const { shopId } = req.params;
  const updateData = req.body;

  try {
    const updatedShop = await Shop.findByIdAndUpdate(shopId, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Validate before updating
    });

    if (!updatedShop) {
      return res.status(404).json({ error: "Shop not found" });
    }

    res.status(200).json(updatedShop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const addCategoryToShop = async (req, res) => {
  const { shopId, categoryData } = req.body;

  if (!shopId || !categoryData) {
    console.error("Missing shopId or categoryData");
    return res
      .status(400)
      .json({ message: "Shop ID and category data are required." });
  }

  try {
    if (categoryData._id) {
      // Update existing category
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryData._id,
        { ...categoryData, shopId }, // Ensure shopId is explicitly updated
        { new: true } // Return the updated document
      );

      if (!updatedCategory) {
        throw new Error("Category not found");
      }

      return res.status(200).json(updatedCategory);
    } else {
      // Create new category
      const category = new Category({ ...categoryData, shopId });
      await category.save();

      await Shop.findByIdAndUpdate(shopId, {
        $push: { categories: category._id },
      });

      return res.status(201).json(category);
    }
  } catch (error) {
    console.error("Error handling category:", error);
    res.status(500).json({ message: "Failed to process category request" });
  }
};



 // Import your Shop model (if categories are linked to shops)

export const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    // Find the category to ensure it exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Remove the category reference from the Shop, if applicable
    if (category.shopId) {
      await Shop.findByIdAndUpdate(category.shopId, {
        $pull: { categories: categoryId },
      });
    }

    // Delete the category from the database
    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};


export const addproducttypeToShop = async (shopId, producttypeData) => {
  const category = new Category(producttypeData);
  await category.save();

  await Shop.findByIdAndUpdate(shopId, { $push: { categories: category._id } });
  console.log("Category added to shop");
};

export const getProductsBySubcategory = async (req, res, next) => {
  const { categoryId } = req.params;

  try {
    // Fetch products belonging to the specified subcategory
    const products = await Product.find({ categoryId: categoryId });

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this subcategory" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products for subcategory:", error.message);
    next(error);
  }
};

export const createproduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const deleteproduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ message: "Error deleting product" });
  }
};
export const createItem = async (req, res, next) => {
  const { type, shopId } = req.params; // 'categories' or 'products'
  const data = req.body;

  try {
    let newItem;

    if (type === "categories") {
      newItem = new Category({ ...data, shopId });
    } else if (type === "products") {
      if (!data.categoryId) {
        return res
          .status(400)
          .json({ message: "categoryId is required for products." });
      }

      // Create the product
      newItem = new Product({ ...data, shopId });

      // Save the product
      const savedProduct = await newItem.save();

      // Add the product to the category's products array
      await Category.findByIdAndUpdate(data.categoryId, {
        $addToSet: { products: savedProduct._id }, // Prevent duplicate product IDs
      });

      return res.status(201).json(savedProduct);
    } else {
      return res.status(400).json({ message: "Invalid type specified." });
    }

    // Save categories
    const savedItem = await newItem.save();
    return res.status(201).json(savedItem);
  } catch (error) {
    console.error("Error creating item:", error.message);
    next(error);
  }
};


export const updateItem = async (req, res, next) => {
  const { type, id, shopId } = req.params; // 'categories' or 'products'
  const updates = req.body;

  try {
    let updatedItem;

    if (type === "categories") {
      updatedItem = await Category.findByIdAndUpdate(
        id,
        { ...updates, shopId },
        { new: true }
      );
    } else if (type === "products") {
      updatedItem = await Product.findByIdAndUpdate(
        id,
        { ...updates, shopId },
        { new: true }
      );
    } else {
      return res.status(400).json({ message: "Invalid type specified." });
    }

    if (!updatedItem) {
      return res
        .status(404)
        .json({ message: `${type.slice(0, -1)} not found.` });
    }

    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error.message);
    next(error);
  }
};

export const updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { name, parentId } = req.body; // Update fields

  try {
    // Find the category by ID
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Update the category fields
    if (name) category.name = name;
    if (parentId) category.parentId = parentId;

    // Save the updated category
    await category.save();

    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
};
