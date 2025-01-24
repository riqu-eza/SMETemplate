/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import HoverButton from "../ux/HoverButton";

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

  // Fallbacks
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
    <div className="relative flex flex-col border border-gray-300 bg-white">
      {/* Discount Badge */}
      {discounts && (
        <div className="absolute top-2 right-2 z-10 bg-[#21942b] text-white text-xs px-3 py-1 rounded shadow-sm">
          {`${discounts} OFF`}
        </div>
      )}

      {/* Product Image */}
      <Link
        to={`/product/${product._id}/${userId}`}
        className="relative w-full h-40 overflow-hidden"
      >
        <img
          src={imageUrls[0] || "/placeholder-image.png"}
          alt={name}
          className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
        />
      </Link>

      {/* Product Details */}
      <div className="p-2 flex flex-col flex-grow text-left">
        {/* Title/Description */}
        <h4 className="text-sm font-semibold mb-1 text-gray-800">{name}</h4>
        <p className="text-xs text-[#697586] leading-4">
          {trimmedDescription}
        </p>

        {/* Price */}
        <p className="text-sm text-[#697586] font-semibold mt-1">
          Ksh {price.toString().replace(/\D/g, "")}
        </p>

        {/* Star Rating */}
        <div className="flex gap-1 py-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
              color={(hover || rating) >= star ? "#FFD700" : "#b9bcc7"}
              className="cursor-pointer"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
