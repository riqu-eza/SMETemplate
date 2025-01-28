/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const ProductDetail = () => {
  const { productId, userId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/listing/products/${productId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data);

        // Set default main image
        if (data.imageUrls && data.imageUrls.length > 0) {
          setSelectedImage(data.imageUrls[0]);
        }

        // If the product has variants, default to the first variant (if you wish)
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0].name); // for example
        }

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return <div className="p-4 text-center">Loading product details...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  // Destructure relevant fields
  const {
    name,
    description,
    price,
    stock,
    discounts,
    availabilityDays,
    availabilityHours,
    imageUrls,
    Type,
    variants,
  } = product;

  // Handle variant selection
  const handleVariantChange = (e) => {
    setSelectedVariant(e.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Top Section: Name, short info */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          {name}
        </h1>
        {Type && (
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Product Type: <span className="font-medium">{Type}</span>
          </p>
        )}
      </div>

      {/* Main Content: Image & Product Info */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Images */}
        <div className="md:w-1/2 flex flex-col">
          {/* Main Image */}
          <div className="w-full h-72 md:h-96 bg-gray-100 border border-sky-200 flex items-center justify-center overflow-hidden rounded-md mb-4">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="text-gray-500">No image available</p>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {imageUrls && imageUrls.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {imageUrls.map((img, index) => (
                <div
                  key={index}
                  className={`cursor-pointer border rounded-md overflow-hidden ${
                    selectedImage === img
                      ? "border-sky-500"
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-20 object-cover transition-transform hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="md:w-1/2 flex flex-col">
          {/* Price & Discounts */}
          <div className="mb-3">
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              Ksh {price}
            </p>
            {discounts && (
              <p className="text-sm md:text-base text-red-500 font-semibold">
                Discounts: {discounts}
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-sm md:text-base text-gray-700 mb-4 leading-relaxed">
            {description}
          </p>

          {/* Variant Selection (optional) */}
          {variants && variants.length > 0 && (
            <div className="mb-4">
              <label
                htmlFor="variant"
                className="block text-sm md:text-base text-gray-700 mb-1 font-medium"
              >
                Choose a variant:
              </label>
              <select
                id="variant"
                value={selectedVariant}
                onChange={handleVariantChange}
                className="border border-sky-200 rounded-md py-2 px-3 text-sm md:text-base w-full focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                {variants.map((variant) => (
                  <option key={variant.name} value={variant.name}>
                    {variant.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Stock & Availability */}
          <div className="mb-4 space-y-1">
            <p className="text-sm md:text-base text-gray-600">
              Stock:{" "}
              <span className="font-medium">
                {stock > 0 ? stock : "Out of stock"}
              </span>
            </p>
            {availabilityDays && availabilityHours && (
              <p className="text-sm md:text-base text-gray-600">
                Available:{" "}
                <span className="font-medium">
                  {availabilityDays.join(", ")} ({availabilityHours})
                </span>
              </p>
            )}
          </div>

          {/* Add to Cart Button */}
          <div>
            <Link
              to={`/cart/${productId}/${userId}`}
              className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Add to Bag
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
