/* eslint-disable react/prop-types */

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

import ProductCard from "./product";
import { chunkArray } from "../utils/chunkArray";

const RelatedProducts = ({ relatedProducts }) => {
  // Group related products into chunks of 2 (each slide will display 2 items vertically)
  const slides = chunkArray(relatedProducts, 2);

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      spaceBetween={10}
      pagination={{ clickable: true }}
      slidesPerView="auto"
      breakpoints={{
        0: { slidesPerView: 1 },
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
    >
      {slides.map((group, index) => (
        <SwiperSlide key={index} style={{ width: "auto" }}>
          <div className="grid grid-rows-2 gap-4">
            {group.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default RelatedProducts;
