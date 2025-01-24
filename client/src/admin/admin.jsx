import { Link } from "react-router-dom";

const AdminPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Navigation</h2>
                <div className="space-y-4">
                    <Link to='/createlisting' className="block bg-blue-500 text-white text-center py-2 rounded hover:bg-blue-600 transition duration-200">
                        Add Product
                    </Link>
                    <Link to='/addblog' className="block bg-green-500 text-white text-center py-2 rounded hover:bg-green-600 transition duration-200">
                        Add Blog
                    </Link>
                    <Link to='/managelisting' className="block bg-yellow-500 text-white text-center py-2 rounded hover:bg-yellow-600 transition duration-200">
                        View Products
                    </Link>
                    <Link to='/manageorders' className="block bg-purple-500 text-white text-center py-2 rounded hover:bg-purple-600 transition duration-200">
                        View Orders
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
