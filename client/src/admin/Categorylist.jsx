/* eslint-disable react/prop-types */

const CategoryList = ({
  categories = [], // Default categories to an empty array
  setSelectedCategory,
  setSelectedSubcategory,
  fetchProducts,
  setEditingItem,
}) => {
  // Ensure categories is an array
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div>
      <h2>Categories</h2>
      {safeCategories.length === 0 ? (
        <p>No categories available. Add a new category to get started.</p>
      ) : (
        <ul>
          {safeCategories.map((category) => (
            <li key={category._id}>
              <strong>{category.name}</strong>
              <button onClick={() => setEditingItem(category)}>Edit</button>
              <button onClick={() => setSelectedCategory(category)}>Select</button>
              <ul>
                {(category.subcategories || []).map((subcategory) => (
                  <li key={subcategory._id}>
                    {subcategory.name}
                    <button onClick={() => setEditingItem(subcategory)}>Edit</button>
                    <button
                      onClick={() => {
                        setSelectedSubcategory(subcategory);
                        fetchProducts(subcategory._id);
                      }}
                    >
                      Select
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => setEditingItem({ type: "category" })}>Add Category</button>
    </div>
  );
};

export default CategoryList;
