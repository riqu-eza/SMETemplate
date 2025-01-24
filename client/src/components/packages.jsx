/* eslint-disable react/prop-types */
// Packages.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { Link } from "react-router-dom";

const Packages = ({ products,userId }) => {
  // Ensure that products is defined and not empty
  if (!products || products.length === 0) {
    return (
      <p className="text-center text-gray-500">No product data available.</p>
    );
  }

  return (
    <div className=" mx-auto flex flex-col gap-12 p-4">
      {products.map((product, index) => (
        <div
          key={product.id || index}
          className={`flex flex-col md:flex-row items-center gap-8 ${
            index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
          }`}
        >
          {/* Left Section: Swiper Image Carousel */}
          <div className="w-full md:w-1/2 flex justify-center">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              className="rounded-lg shadow-lg w-full max-w-md"
            >
              {product.imageUrls && product.imageUrls.length > 0 ? (
                product.imageUrls.map((imageUrl, idx) => (
                  <SwiperSlide key={idx}>
                    <img
                      src={imageUrl}
                      alt={`Product ${idx}`}
                      className="w-full h-72 object-cover rounded-lg"
                    />
                  </SwiperSlide>
                ))
              ) : (
                <p>No images available.</p>
              )}
            </Swiper>
          </div>

          {/* Right Section: Product Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            {/* Product Name */}
            <h2 className="text-3xl font-medium mb-2 leading-[54px] text-[#383838]">
              {product.name}
            </h2>

            {/* Product Description */}
            <p className="text-[#697586] mb-4 text-[16px]">
              {product.description}
            </p>

            {/* Ingredients */}
            {product.ingridients && product.ingridients.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {product.ingridients.map((item, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-200 text-[#383838] text-sm px-2 py-1 rounded"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No ingredients listed.</p>
            )}

            {/* Product Price and Links */}
            <div className="text-lg font-semibold text-gray-700 flex gap-4">
              <Link
                to={`/cart/${product._id}/${userId}`}
                className="bg-[#F5A3B7] hover:bg-[#383838] text-white py-2 px-12 rounded transition-all"
              >
                Shop now
              </Link>
              <Link
                to={`/product/${product._id}/${userId}`}
                className="text-gray-700 hover:text-[#F5A3B7] ml-4 flex items-center gap-2 transition-all"
              >
                Explore more
                <span className="transition-transform transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Packages;
