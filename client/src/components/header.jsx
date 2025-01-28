/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingCart } from "react-icons/fi";
import "./components.css";

const Header = ({ data }) => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Show a loading/fallback if no data yet
  if (!data || !data.length) {
    return (
      <header className="bg-sky-600 text-white p-4">
        Loading shop data...
      </header>
    );
  }

  // Access the first shop in the array
  const currentShop = data[0];

  // Handle search action
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
    }
  };

  return (
    <header className="bg-sky-500 text-white flex flex-col md:flex-row items-start md:items-center justify-between py-3 px-4 md:px-10 shadow-md">
      {/* Left Section: Shop Name */}
      <div className="mb-2 md:mb-0">
        <Link to="/" className="text-xl md:text-2xl font-bold hover:text-sky-100 transition-colors">
          {currentShop?.name || "Default Shop Name"}
        </Link>
      </div>

      {/* Middle Section: Location (if available) */}
      <div className="md:flex-grow md:text-center text-sm md:text-base mb-2 md:mb-0">
        {currentShop?.location?.address && currentShop?.location?.mapurl?.[0] ? (
          <a
            href={currentShop.location.mapurl[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-sky-200 hover:text-sky-100 transition-colors"
          >
            {currentShop.location.address}
          </a>
        ) : (
          <p className="text-sky-100">Location not available</p>
        )}
      </div>

      {/* Right Section: Search, Cart, Profile */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Search */}
        <div className="relative">
          {isInputVisible ? (
            <div className="flex items-center border border-sky-300 rounded-md bg-white shadow-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none outline-none w-32 md:w-52 p-1 text-black placeholder-gray-400"
                placeholder="Search..."
              />
              <button
                onClick={handleSearch}
                className="px-2 py-1 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FiSearch size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsInputVisible(true)}
              className="hover:text-sky-300 transition-colors"
            >
              <FiSearch size={20} />
            </button>
          )}
        </div>

        {/* Cart */}
        <Link
          to="/cart"
          className="relative text-xl hover:text-sky-300 transition-colors"
          title="View Cart"
        >
          <FiShoppingCart />
        </Link>

        {/* Profile */}
        <Link
          to="/login"
          className="hover:text-sky-300 transition-colors"
          title="Profile / Login"
        >
          Profile
        </Link>
      </div>
    </header>
  );
};

export default Header;
