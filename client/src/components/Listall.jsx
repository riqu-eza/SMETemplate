import { useEffect, useState } from "react";
import ProductCard from "./product";
import Header from "./header";

const Listtall = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Default page is 1
    const [productsPerPage] = useState(9); // Number of products per page

    // Fetch products from the API
    const fetchProducts = async () => {
        try {
            const response = await fetch("/api/listing/gellisting");
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setProducts(data); // Set the fetched products
        } catch (err) {
            console.error("Fetch Error:", err);
        }
    };

    // Get the products to display based on the current page
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    // Pagination logic: Calculate total number of pages
    const totalPages = Math.ceil(products.length / productsPerPage);

    // Use effect to load products
    useEffect(() => {
        fetchProducts();
    }, []);

    // Handle page change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <>
        <Header/>
            <div  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ml-2 p-5 justify-items-center">
                {currentProducts.length > 0 ? (
                    currentProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))
                ) : (
                    <p>No products found for this category.</p>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-4">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 mx-2 bg-gray-200 rounded"
                >
                    Previous
                </button>

                <span className="flex items-center px-4 py-2">
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 mx-2 bg-gray-200 rounded"
                >
                    Next
                </button>
            </div>
        </>
    );
};

export default Listtall;
