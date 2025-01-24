/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingCart } from "react-icons/fi";
import "./components.css";

const Header = ({ data }) => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  if (!data) {
    return <footer>Loading footer data...</footer>;
  }

  // Access the first shop in the array
  const currentShop = data[0];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
    }
  };

  return (
    <header className="bg-[#232629] text-[#b2b8c2] flex flex-col md:flex-row items-start md:items-center justify-between p-2">
      {/* Left Section: Brand Name */}
      <div className="mb-2 md:mb-0">
        <Link to="/" className="text-2xl font-bold pl-2 md:pl-10">
          {currentShop?.name || "Default Shop Name"}
        </Link>
      </div>

      {/* Middle Section: Location (if available) */}
      <div className="mb-2 md:mb-0 md:flex-grow text-sm md:text-base flex flex-col items-start">
        {currentShop?.location?.address && currentShop?.location?.mapurl?.[0] ? (
          <a
            href={currentShop.location.mapurl[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {currentShop.location.address}
          </a>
        ) : (
          <p>Location not available</p>
        )}
      </div>

      {/* Right Section: Search, Cart, Profile */}
      <div className="flex items-center gap-4 md:gap-8 text-base pr-2 md:pr-10">
        {/* Search */}
        <div className="relative">
          {isInputVisible ? (
            <div className="flex items-center border border-gray-300 rounded-md p-1 bg-white shadow-lg">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none outline-none w-32 md:w-52 text-black"
                placeholder="Search..."
              />
              <button
                onClick={handleSearch}
                className="ml-1 p-2 text-gray-500 hover:text-gray-800"
              >
                <FiSearch size={20} />
              </button>
            </div>
          ) : (
            <span
              className="cursor-pointer hover:underline"
              onClick={() => setIsInputVisible(true)}
            >
              Search
            </span>
          )}
        </div>

        {/* Cart */}
        <Link to="/cart" className="relative text-xl md:text-3xl">
          <FiShoppingCart />
        </Link>

        {/* Profile */}
        <Link to="/login" className="hover:underline">
          Profile
        </Link>
      </div>
    </header>
  );
};

export default Header;
