import { useEffect, useState } from "react";

const ManagerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null); // Selected order to display details
    const [orderDetails, setOrderDetails] = useState(null); // State to store fetched order details
    const itemsPerPage = 10; // Number of orders per page

    // Fetch Orders Function
    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/order/getall"); // Replace with your API endpoint
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setOrders(data);
            console.log(data);
        } catch (err) {
            console.error("Fetch Orders Error:", err);
        }
    };
    const fetchOrderDetails = async (orderId) => {
        try {
            const response = await fetch(`/api/order/getorder/${orderId}`);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setOrderDetails(data);
            console.log
        } catch (err) {
            console.error("Fetch Order Details Error:", err);
        }
    };
    useEffect(() => {
        fetchOrders();
    }, []);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleShowDetails = (order, type) => {
        if (type === "products") {
            fetchOrderDetails(order.orderId);
            setSelectedOrder({ ...order, type });

            setOrderDetails(order); // Assuming order contains products data
        } else {
            // For KYC and Location, we can directly use the existing order data
            setSelectedOrder({ ...order, type });
            setOrderDetails(order); // Use existing order data
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Orders</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="overflow-auto border border-gray-300 rounded-md shadow-md col-span-2">
                    <table className="table-auto w-full text-sm border-collapse">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-4 py-2 border">Order ID</th>
                                <th className="px-4 py-2 border">Date</th>
                                <th className="px-4 py-2 border">Total Price</th>
                                <th className="px-4 py-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-100">
                                    <td className="px-4 py-2 border">{order.orderId}</td>
                                    <td className="px-4 py-2 border">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2 border">Ksh {order.totalPrice}</td>
                                    <td className="px-4 py-2 border">
                                        <button
                                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
                                            onClick={() => handleShowDetails(order, "products")}
                                        >
                                            View Products
                                        </button>
                                        <button
                                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 mr-2"
                                            onClick={() => handleShowDetails(order, "location")}
                                        >
                                            View Location
                                        </button>
                                        <button
                                            className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                                            onClick={() => handleShowDetails(order, "kyc")}
                                        >
                                            View KYC
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

                {selectedOrder && orderDetails && (
                    <div className="border border-gray-300 rounded-md shadow-md p-4">
                        <h2 className="text-xl font-semibold mb-4">
                            {selectedOrder.type === "products" && "Products Details"}
                            {selectedOrder.type === "location" && "Location Details"}
                            {selectedOrder.type === "kyc" && "KYC Details"}
                        </h2>
                        {selectedOrder.type === "products" && (
                            <div>
                                {/* Assuming 'items' is part of the order object */}
                                <p>Order ID: {orderDetails.orderId}</p>
                                <p>Total Price: Ksh {orderDetails.totalPrice}</p>
                                {/* Display items if available */}
                                {orderDetails.items && orderDetails.items.length > 0 ? (
                                    <>
                                        <p>Items:</p>
                                        <ul>
                                            {orderDetails.items.map((item, index) => (
                                                <li key={index}>
                                                    {item.name} - Ksh {item.price} x {item.quantity}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <p>No items found for this order.</p>
                                )}
                            </div>
                        )}
                        {selectedOrder.type === "location" && (
                            <div>
                                <p>Address: {orderDetails.address}</p>
                                <p>City: {orderDetails.city}</p>
                                <p>Country: {orderDetails.country}</p>
                            </div>
                        )}
                        {selectedOrder.type === "kyc" && (
                            <div>
                                <p>Name: {orderDetails.firstName} {orderDetails.lastName}</p>
                                <p>Email: {orderDetails.email}</p>
                                <p>Phone: {orderDetails.phoneNumber}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerOrders;
