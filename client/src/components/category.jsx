/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import ProductCard from "./product";
import "./components.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const CategoryRow = ({ categoryName, products, userId }) => {
  // eslint-disable-next-line no-unused-vars
  const truncateContent = (content) => {
    return content?.split(" ").slice(0, 14).join(" ") + "...";
  };

  return (
    <div className="mx-auto px-1 py-4 ">
      <div className="text-center">
        <h2 className="text-[24px] text-center font-bold font-[Poppins] md:p-1">
          {categoryName}
        </h2>

        <Link
          to={`/category/${categoryName}`}
          state={{ products }} // Directly pass state here
          className="text-[#697586] font-[Poppins] text-[18px] text-center hover:text-[#F5A3B7]"
        >
          see all
        </Link>
      </div>

      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={3} // Default for large screens
        slidesPerGroup={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          0: { slidesPerView: 1 }, // Small screens
          640: { slidesPerView: 2 }, // Medium screens
          1024: { slidesPerView: 3 }, // Large screens
        }}
        className="w-full "
      >
        {products.map((product, index) => (
          <SwiperSlide key={index} style={{ width: "auto" }}  className="flex justify-center">
            <ProductCard product={product} userId={userId} />
          </SwiperSlide>
        ))}
      </Swiper>

      <hr className="border-t border-gray-900 my-4" />
    </div>
  );
};

export default CategoryRow;
