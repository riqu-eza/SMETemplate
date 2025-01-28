/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const ProductCard = ({ product, userId }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);

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

  const handleRating = (starValue) => {
    setRating(starValue);
    saveRating(starValue);
  };

  const {
    imageUrls = ["/placeholder-image.png"],
    name = "Unknown Product",
    description = "No description available.",
    price = "N/A",
    discounts = null,
  } = product;

  const trimmedDescription =
    description.split(" ").slice(0, 7).join(" ") + "...";

  return (
    <div className="relative flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Discount Badge */}
      {discounts && (
        <div className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded">
          {`${discounts} OFF`}
        </div>
      )}

      <Link
        to={`/product/${product._id}/${userId}`}
        className="relative w-full h-36 overflow-hidden rounded-t-lg"
      >
        <img
          src={imageUrls[0] || "/placeholder-image.png"}
          alt={name}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        />
      </Link>

      <div className="p-3 flex flex-col flex-grow">
        <h4 className="text-sm font-medium text-gray-700">{name}</h4>
        <p className="text-xs text-gray-500 mt-1">{trimmedDescription}</p>
        <p className="text-sm font-semibold text-gray-800 mt-auto">
          Ksh {price.toString().replace(/\D/g, "")}
        </p>
        <div className="flex mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
              color={(hover || rating) >= star ? "#FFD700" : "#D1D1D1"}
              className="cursor-pointer mr-1"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
