/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
// import Header from "../components/header";
// import { FaCheck } from "react-icons/fa";

const ProductListing = () => {
  const { productId, userId } = useParams();
  const [product, setProduct] = useState();
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/listing/products/${productId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProduct(data);
      setSelectedImage(data.imageUrls?.[0] || ""); // Default to the first image if available
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Destructure the relevant fields to display
  const {
    name,
    description,
    price,
    stock,
    discounts,
    availabilityDays,
    availabilityHours,
    imageUrls,
  } = product;

  return (
    <>
      <div className="flex flex-col md:flex-row gap-2 p-2 border border-blue-700">
        {/* Left Section */}
        <div className="flex-1 p-1 flex flex-col items-center justify-center border border-blue-700">
          {/* Main Image */}
          <div className="h-96 mb-2 border border-blue-700">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={name}
                className="w-full h-full border object-cover"
              />
            ) : (
              <p className="text-gray-500">No image available</p>
            )}
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
            {imageUrls &&
              imageUrls.map((img, index) => (
                <div
                  key={index}
                  className="h-20 cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 p-4 flex flex-col">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#383838] mb-2">
            {name}
          </h2>
          <p className="text-lg font-semibold text-[#383838] mb-2">
            Price: Ksh {price}
          </p>
          <p className="text-sm sm:text-base text-[#697586] mb-4">
            {description}
          </p>
          <p className="text-sm sm:text-base text-[#697586] mb-4">
            Stock: {stock}
          </p>
          {discounts && (
            <p className="text-sm sm:text-base text-[#697586] mb-4">
              Discounts: {discounts}
            </p>
          )}
          <p className="text-sm sm:text-base text-[#697586] mb-4">
            Availability: {availabilityDays?.join(", ")} ({availabilityHours})
          </p>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col gap-2">
            <Link
              to={`/cart/${productId}/${userId}`}
              className="bg-[#F5A3B7] hover:bg-[#383838] text-white font-semibold py-2 px-4 text-center rounded-md w-full sm:w-1/2"
            >
              Add to Bag
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductListing;
