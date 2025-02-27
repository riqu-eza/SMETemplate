/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import ProductCard from "../components/product.jsx";

const Productfilter = ({ categoryName, products, userId }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(() => window.innerWidth < 768);
  const productContainerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine items per page based on screen size
  const itemsPerPage = isSmallScreen ? 4 : 8;

  const [selectedType, setSelectedType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to normalize type names
  const normalizeType = (type) => {
    if (!type) return "";
    let normalized = type.trim().toLowerCase();
    if (normalized.endsWith("s")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  // Create a list of unique normalized types
  const types = ["All", ...new Set(products.map((p) => normalizeType(p.Type)))];

  // Filter the products using the normalized type
  const filteredProducts =
    selectedType === "All"
      ? products
      : products.filter((p) => normalizeType(p.Type) === selectedType);

  // Paginate
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (productContainerRef.current) {
      productContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Remove the scroll event listener that resets the page number
  // (Commented out to prevent auto-reset when scrolling near the top)
  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (window.scrollY < 50 && currentPage > 1) {
  //       setCurrentPage((prev) => Math.max(prev - 1, 1));
  //     }
  //   };
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [currentPage]);

  // Ensure the page starts at the top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

          <ul
            className={`
              flex md:flex-col gap-2
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
                  cursor-pointer py-2 px-3 rounded transition-colors whitespace-nowrap
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
        <div ref={productContainerRef} className="md:w-3/4 w-full p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <ProductCard key={product._id} product={product} userId={userId} />
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
