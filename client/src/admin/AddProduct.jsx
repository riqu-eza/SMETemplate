import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AddEditForm from "./Addedit.jsx";

const AddProductsPage = () => {
  const { shopId } = useParams();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Fetch categories for the shop
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/property/shop/${shopId}/categories`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [shopId]);

  // Fetch products for a category
  const fetchProducts = async (categoryId) => {
    try {
      const response = await fetch(
        `/api/property/categories/${categoryId}/products`
      );
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []); // Safeguard for non-array responses
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]); // Reset to empty array on error
    }
  };

  const deleteProduct = async (productId) => {
    const confirmed = window.confirm(
      `'Are you sure you want to delete this product?'${productId}`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/property/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to delete product: ${errorMessage}`);
      }

      setProducts(products.filter((product) => product._id !== productId));
      alert("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error.message);
      alert("Failed to delete product");
    }
  };
  const saveCategory = async (category) => {
    try {
      const endpoint = category._id
        ? `/api/property/categories/${category._id}` // Update existing category
        : `/api/property/category/create`; // Create new category
  
      const method = category._id ? "PUT" : "POST"; // Use PUT for update, POST for create
  
      // Prepare the body without altering the _id for updates
      const body = {
        shopId,
        categoryData: { ...category }, // Include all category fields
      };
  
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save category");
      }
  
      const data = await response.json();
  
      if (category._id) {
        // Replace the updated category in the list
        setCategories((prev) =>
          prev.map((cat) => (cat._id === data._id ? data : cat))
        );
      } else {
        // Add new category to the list
        setCategories((prev) => [...prev, data]);
      }
  
      setEditingCategory(null); // Close the form
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category");
    }
  };
  

  // Delete category
  const deleteCategory = async (categoryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/property/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      setCategories(
        categories.filter((category) => category._id !== categoryId)
      );
      if (selectedCategory?._id === categoryId) {
        setSelectedCategory(null); // Clear selected category if deleted
        setProducts([]);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Products</h1>

      <div className="flex gap-6">
        {/* Categories List */}
        <div className="w-1/4">
          <h2 className="text-xl font-semibold mb-2">Categories</h2>
          <div className="bg-white shadow rounded p-4">
            <ul>
              {categories.map((category) => (
                <li
                  key={category._id}
                  className={`p-2 rounded cursor-pointer ${
                    selectedCategory?._id === category._id
                      ? "bg-gray-400 text-white"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory(category);
                    fetchProducts(category._id);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span>{category.name}</span>
                    <div className="flex gap-2">
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategory(category);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent category selection
                          const confirmed = window.confirm(
                            `Are you sure you want to delete the category "${category.name}"?`
                          );
                          if (confirmed) deleteCategory(category._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <button
              className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
              onClick={() => setEditingCategory({ name: "" })}
            >
              Add Category
            </button>
          </div>
        </div>

        {/* Products List */}
        <div className="w-3/4">
          {selectedCategory ? (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Products in {selectedCategory.name}
              </h2>
              <div className="bg-white shadow rounded p-4">
                {products.length === 0 ? (
                  <p>No products found. Add a new product to get started.</p>
                ) : (
                  <ul>
                    {products.map((product) => (
                      <li
                        key={product._id}
                        className="flex justify-between items-center mb-2"
                      >
                        <span>{product.name}</span>
                        <div className="flex gap-2">
                          <button
                            className="text-blue-500 hover:underline"
                            onClick={() =>
                              setEditingItem({ ...product, type: "product" })
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-500 hover:underline"
                            onClick={() => deleteProduct(product._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
                  onClick={() =>
                    setEditingItem({
                      type: "product",
                      categoryId: selectedCategory._id,
                    })
                  }
                >
                  Add Product
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Select a category to view products.</p>
          )}
        </div>
      </div>

      {/* Category Form */}
      {editingCategory && (
        <div className="bg-gray-100 p-4 rounded shadow mt-4">
          <h2 className="text-lg font-bold mb-2">
            {editingCategory._id ? "Edit Category" : "Add Category"}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveCategory(editingCategory);
            }}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={editingCategory.name}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setEditingCategory(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add/Edit Form for Products */}
      {editingItem && editingItem.type === "product" && (
        <AddEditForm
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          shopId={shopId}
          refreshData={() => fetchProducts(selectedCategory?._id)}
        />
      )}
    </div>
  );
};

export default AddProductsPage;
