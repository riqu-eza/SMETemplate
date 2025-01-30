/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import ProductCard from "../components/product.jsx";

const Productfilter = ({ categoryName, products, userId }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine how many items per page based on screen size
  const itemsPerPage = isSmallScreen ? 4 : 6;

  const [selectedType, setSelectedType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Create a list of unique types
  const types = ["All", ...new Set(products.map((p) => p.Type))];

  // Filter the products by the selected type
  const filteredProducts =
    selectedType === "All"
      ? products
      : products.filter((p) => p.Type === selectedType);

  // Paginate
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    // Main background with a sky-blue gradient
    <div className="min-h-screen pb-6 bg-gradient-to-b from-sky-50 to-sky-100">
      {/* Page title */}
      <h1 className="text-base font-semibold text-center text-sky-700 py-2">
        {categoryName} Products
      </h1>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row bg-white shadow-md rounded-md">
        {/* Filters Section */}
        <div className="md:w-1/4 w-full p-4 border-b md:border-b-0 md:border-r border-sky-200 bg-sky-50">
          <h3 className="text-xm font-bold text-sky-700 mb-4">Filter by Type</h3>

          {/**
           * On small screens: horizontal, scrollable filter list
           * On medium+ screens: vertical list with spacing
           */}
          <ul
            className={`
              flex md:flex-col
              gap-2
              overflow-x-auto md:overflow-visible
              scrollbar-thin scrollbar-thumb-rounded
            `}
          >
            {types.map((type) => (
              <li
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setCurrentPage(1);
                }}
                className={`
                  cursor-pointer py-2 px-3 rounded transition-colors 
                  whitespace-nowrap
                  ${
                    selectedType === type
                      ? "bg-sky-200 text-sky-900 font-semibold shadow-sm"
                      : "bg-sky-100 hover:bg-sky-200 text-sky-800"
                  }
                `}
              >
                {type}
              </li>
            ))}
          </ul>
        </div>

        {/* Products Section */}
        <div className="md:w-3/4 w-full p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  userId={userId}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-600">
                No products found.
              </p>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center space-x-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-sky-400 hover:bg-sky-500 text-white rounded px-4 py-2 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sky-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-sky-400 hover:bg-sky-500 text-white rounded px-4 py-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Productfilter;
