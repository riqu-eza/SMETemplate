// controllers/Shop.controller.js (updated for multi-tenancy)

// Note: No direct imports from "../Models/Shop.model.js", etc.

export const fetchCategoriesForShop = async (req, res, next) => {
  const { shopId } = req.params;
  // Get tenant-specific models
  const { Shop, Category } = req.models;
  
  try {
    // Verify the shop exists on the tenant-specific connection
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
  const { Shop } = req.models;
  console.log(req.body);
  try {
    const shop = new Shop(req.body);
    await shop.save();
    res.status(201).json(shop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getShop = async (req, res, next) => {
  const { Shop } = req.models;
  try {
    const shops = await Shop.find(); // Query on the tenant-specific connection
    res.status(200).json(shops);
  } catch (err) {
    console.error("Error fetching shops:", err.message);
    next(err);
  }
};

export const updateShop = async (req, res) => {
  const { shopId } = req.params;
  const updateData = req.body;
  const { Shop } = req.models;
  
  try {
    const updatedShop = await Shop.findByIdAndUpdate(shopId, updateData, {
      new: true,
      runValidators: true,
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
  const { Shop, Category } = req.models;
  
  if (!shopId || !categoryData) {
    console.error("Missing shopId or categoryData");
    return res.status(400).json({ message: "Shop ID and category data are required." });
  }

  try {
    if (categoryData._id) {
      // Update existing category on tenant-specific connection
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryData._id,
        { ...categoryData, shopId },
        { new: true }
      );
      if (!updatedCategory) {
        throw new Error("Category not found");
      }
      return res.status(200).json(updatedCategory);
    } else {
      // Create new category on tenant-specific connection
      const category = new Category({ ...categoryData, shopId });
      await category.save();

      // Update the shop's categories array
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

export const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { Shop, Category } = req.models;
  
  try {
    // Ensure the category exists on the tenant-specific connection
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    // Remove the category reference from the Shop
    if (category.shopId) {
      await Shop.findByIdAndUpdate(category.shopId, {
        $pull: { categories: categoryId },
      });
    }
    // Delete the category
    await Category.findByIdAndDelete(categoryId);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};

export const addproducttypeToShop = async (shopId, producttypeData) => {
  // For non-request functions, you may need to pass in the tenant-specific models as arguments.
  // Alternatively, if this is used in a route, use req.models.
  const { Shop, Category } = req.models; // Make sure req.models is available in context!
  
  try {
    const category = new Category(producttypeData);
    await category.save();
    await Shop.findByIdAndUpdate(shopId, { $push: { categories: category._id } });
    console.log("Category added to shop");
  } catch (error) {
    console.error("Error adding product type to shop:", error);
  }
};

export const getProductsBySubcategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const { Product } = req.models;
  
  try {
    // Fetch products on the tenant-specific connection
    const products = await Product.find({ categoryId });
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for this subcategory" });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products for subcategory:", error.message);
    next(error);
  }
};

export const createproduct = async (req, res) => {
  const { Product } = req.models;
  
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
  const { Product } = req.models;
  
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
  const { type, shopId } = req.params;
  const { Category, Product } = req.models;

  // data could be a single object or an array
  const data = req.body;

  try {
    if (type === "products") {
      // If it's an array, loop or use insertMany
      if (Array.isArray(data)) {
        // Validate each item has categoryId
        for (let item of data) {
          if (!item.categoryId) {
            return res
              .status(400)
              .json({ message: "categoryId is required for products." });
          }
        }

        // Bulk insert
        const result = await Product.insertMany(
          data.map((prod) => ({ ...prod, shopId }))
        );

        // For each product, also update the Category doc
        for (let product of result) {
          await Category.findByIdAndUpdate(product.categoryId, {
            $addToSet: { products: product._id },
          });
        }

        return res.status(201).json(result);
      } else {
        // Single product
        if (!data.categoryId) {
          return res.status(400).json({ message: "categoryId is required for products." });
        }
        const newProduct = new Product({ ...data, shopId });
        const savedProduct = await newProduct.save();

        // Add the product to the category's products array
        await Category.findByIdAndUpdate(data.categoryId, {
          $addToSet: { products: savedProduct._id },
        });
        return res.status(201).json(savedProduct);
      }
    }

    if (type === "categories") {
      const newItem = new Category({ ...data, shopId });
      const savedItem = await newItem.save();
      return res.status(201).json(savedItem);
    }

    return res.status(400).json({ message: "Invalid type specified." });
  } catch (error) {
    console.error("Error creating item:", error.message);
    next(error);
  }
};


export const updateItem = async (req, res, next) => {
  const { type, id, shopId } = req.params; // 'categories' or 'products'
  const updates = req.body;
  const { Category, Product } = req.models;
  
  try {
    let updatedItem;
    if (type === "categories") {
      updatedItem = await Category.findByIdAndUpdate(id, { ...updates, shopId }, { new: true });
    } else if (type === "products") {
      updatedItem = await Product.findByIdAndUpdate(id, { ...updates, shopId }, { new: true });
    } else {
      return res.status(400).json({ message: "Invalid type specified." });
    }
    if (!updatedItem) {
      return res.status(404).json({ message: `${type.slice(0, -1)} not found.` });
    }
    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error.message);
    next(error);
  }
};

export const updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { name, parentId } = req.body; // fields to update
  const { Category } = req.models;
  
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    if (name) category.name = name;
    if (parentId) category.parentId = parentId;
    await category.save();
    res.status(200).json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
};
