import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Profile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if not authenticated
      return;
    }

    const user = JSON.parse(localStorage.getItem("user")); // Retrieve user data
    if (user) {
      setCurrentUser(user); // Set currentUser state
    }
  }, [navigate]);

  if (!currentUser) {
    return <div>Loading...</div>; // Optionally handle loading state
  }

  const { firstName, lastName, email, role, address, orders } = currentUser;

  return (
    <div className="p-8 bg-sky-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-sky-800">My Account</h2>
      </div>

      {/* Profile Information */}
      <div className="mb-8 bg-white shadow-md rounded-lg p-6 border border-sky-200">
        <h3 className="text-2xl font-bold text-sky-800 mb-4">
          Profile Information
        </h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="font-semibold text-sky-600 w-24">Name:</span>
            <span className="text-sky-800">
              {firstName ? `${firstName} ${lastName}` : "Not available"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-sky-600 w-24">Email:</span>
            <span className="text-sky-800">{email || "Not available"}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-sky-600 w-24">Role:</span>
            <span className="text-sky-800">{role || "Not available"}</span>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="flex flex-col lg:flex-row mt-8 gap-8">
        {/* Orders Section */}
        <div className="w-full lg:w-2/3 pr-0 lg:pr-4">
          <h3 className="text-lg font-semibold text-sky-800">My Orders</h3>
          <ul className="mt-4">
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <li
                  key={order.id}
                  className="flex justify-between border-b py-2 text-sky-800"
                >
                  <span>{order.productName}</span>
                  <span>Quantity: {order.quantity}</span>
                </li>
              ))
            ) : (
              <li className="py-2 text-sky-800">No orders available</li>
            )}
          </ul>
        </div>

        {/* Address Information */}
        <div className="w-full lg:w-1/3 pl-0 lg:pl-4 lg:border-l border-sky-200">
          <h3 className="text-lg font-semibold text-sky-800">Address Information</h3>
          {address ? (
            <div className="mt-4 text-sky-800">
              <p>{address.street || "Street not available"}</p>
              <p>
                {address.city || "City not available"},{' '}
                {address.state || "State not available"}{' '}
                {address.zip || "ZIP not available"}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sky-800">Address not available</p>
          )}
          <button className="mt-4 px-4 py-2 text-white bg-sky-500 rounded-lg hover:bg-sky-600">
            Edit Address
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
