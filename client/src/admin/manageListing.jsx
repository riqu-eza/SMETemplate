import { useEffect, useState } from "react";

const ManageListing = () => {
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({});

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Number of products per page

    // Fetch products on load
    const fetchProducts = async () => {
        try {
            const response = await fetch("/api/listing/getlisting");
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setProducts(data);
            console.log(data)
        } catch (err) {
            console.error("Fetch Error:", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Delete a product
    const deleteProduct = async (id) => {
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setProducts(products.filter((product) => product._id !== id));
            }
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    // Handle Edit
    const handleEdit = (product) => {
        setEditingProduct(product._id);
        setFormData(product);
    };

    // Handle Update
    const handleUpdate = async () => {
        try {
            const response = await fetch(`/api/products/${formData._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setEditingProduct(null);
                fetchProducts();
            }
        } catch (err) {
            console.error("Update Error:", err);
        }
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(products.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container mx-auto p-6 h-screen flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Products</h1>
            <div className="overflow-auto flex-1">
                <table className="table-auto w-full border-collapse border border-gray-300 shadow-md">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">Name</th>
                            <th className="border border-gray-300 px-4 py-2">Description</th>
                            <th className="border border-gray-300 px-4 py-2">Price</th>
                            <th className="border border-gray-300 px-4 py-2">Discount</th>
                            <th className="border border-gray-300 px-4 py-2">Count</th>
                            <th className="border border-gray-300 px-4 py-2">Category</th>
                            <th className="border border-gray-300 px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-100">
                                {editingProduct === product._id ? (
                                    <>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-2 py-1 border rounded"
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <input
                                                type="text"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                className="w-full px-2 py-1 border rounded"
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                className="w-full px-2 py-1 border rounded"
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <input
                                                type="text"
                                                name="discount"
                                                value={formData.discount}
                                                onChange={handleChange}
                                                className="w-full px-2 py-1 border rounded"
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <input
                                                type="number"
                                                name="count"
                                                value={formData.count}
                                                onChange={handleChange}
                                                className="w-full px-2 py-1 border rounded"
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <input
                                                type="text"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full px-2 py-1 border rounded"
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button
                                                onClick={handleUpdate}
                                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingProduct(null)}
                                                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                                        <td className="border border-gray-300 px-4 py-2">{product.description}</td>
                                        <td className="border border-gray-300 px-4 py-2">{product.price}</td>
                                        <td className="border border-gray-300 px-4 py-2">{product.discount}</td>
                                        <td className="border border-gray-300 px-4 py-2">{product.count}</td>
                                        <td className="border border-gray-300 px-4 py-2">{product.category}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteProduct(product._id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center items-center mt-4">
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-300"}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ManageListing;
