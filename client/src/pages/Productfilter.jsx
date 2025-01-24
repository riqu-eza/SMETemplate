/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import ProductCard from "../components/product.jsx";

const ProductListing = ({ categoryName, products, userId }) => {
  // 1) Track whether we're on a small screen (<768px)
  const [isSmallScreen, setIsSmallScreen] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2) Decide itemsPerPage based on screen size
  const itemsPerPage = isSmallScreen ? 4 : 6;

  const [selectedType, setSelectedType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const types = ["All", ...new Set(products.map((p) => p.Type))];

  const filteredProducts =
    selectedType === "All"
      ? products
      : products.filter((p) => p.Type === selectedType);

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      {/* Keep a row flex for the filter + products */}
      <div className="flex flex-row bg-[#dfe3eb] p-2">
        {/* Filters Section */}
        <div className="w-1/4 p-2 border-r">
          <h3 className="text-lg text-[#232629] bg-[#b6c1d3] rounded-lg text-center font-bold mb-4 px-2 py-1">
            Filter by Type
          </h3>
          <ul className="space-y-2 bg-[#8b94a3] p-2 rounded-md max-h-60 overflow-y-auto">
            {types.map((type) => (
              <li
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setCurrentPage(1);
                }}
                className={`cursor-pointer p-2 text-center rounded text-sm ${
                  selectedType === type
                    ? "bg-[#93b3e6] text-white"
                    : "bg-[#d1ddf0] hover:bg-[#9eaecc]"
                }`}
              >
                {type}
              </li>
            ))}
          </ul>
        </div>

        {/* Products Section */}
        <div className="w-3/4 p-2">
          <h2 className="text-base font-bold mb-2 text-center">
            Products in {categoryName}
          </h2>

          {/* Responsive 2-col grid on small, 4-col on md+ (unchanged) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <ProductCard key={product._id} product={product} userId={userId} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-600 text-sm">
                No products found.
              </p>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex flex-row justify-center items-center space-x-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-400 text-sm"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-400 text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductListing;
