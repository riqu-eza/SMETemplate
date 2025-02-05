/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const ProductCard = ({ product, userId }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);

  // Function to save rating to backend
  const saveRating = async (starValue) => {
    try {
      const payload = { productId: product._id, rating: starValue };
      const response = await fetch("/api/listing/saverating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Failed to save rating: ${response.status}`);
      }
      console.log("Rating saved:", await response.json());
    } catch (error) {
      console.error("Error saving rating:", error.message);
    }
  };

  // Handle Star Rating Click
  const handleRating = (starValue) => {
    setRating(starValue);
    saveRating(starValue);
  };

  // Extract Product Details with Defaults
  const {
    imageUrls = ["/placeholder-image.png"],
    name = "Unknown Product",
    description = "No description available.",
    price = "N/A",
    discounts = null,
  } = product;

  // Trim description to 10 words for brevity
  const trimmedDescription =
    description.split(" ").slice(0, 10).join(" ") + "...";

  // Convert price to a formatted number
  const formattedPrice =
    typeof price === "number"
      ? `Ksh ${price.toLocaleString()}`
      : "Price Not Available";

  // Calculate Discounted Price (if applicable)
  let discountedPrice = price;
  if (discounts && parseInt(discounts) > 0) {
    const discountAmount = (parseInt(discounts) / 100) * price;
    discountedPrice = price - discountAmount;
  }

  return (
    <div className="relative flex flex-col bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Discount Badge */}
      {/* {discounts && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
          {`${discounts} OFF`}
        </div>
      )} */}

      {/* Product Image */}
      <Link
        to={`/product/${product._id}/${userId}`}
        className="relative w-full h-40 overflow-hidden rounded-t-xl"
      >
        <img
          src={imageUrls[0] || "/placeholder-image.png"}
          alt={name}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        />
      </Link>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow">
        <h4 className="text-sm font-medium text-gray-700 truncate">{name}</h4>
        <p className="text-xs text-gray-500 mt-1">{trimmedDescription}</p>

        {/* Price with Discount Display */}
        <div className="flex items-center mt-2">
          {discounts ? (
            <>
              <span className="text-sm text-gray-500 line-through mr-2">
                {formattedPrice}
              </span>
              <span className="text-lg font-bold text-red-600">
                Ksh {discountedPrice.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-800">
              {formattedPrice}
            </span>
          )}
        </div>

        {/* Star Rating */}
        <div className="flex mt-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
              color={(hover || rating) >= star ? "#FFD700" : "#D1D1D1"}
              className="cursor-pointer transition-colors duration-200 mr-1"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
