/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

const HomeSection = ({ imageUrl1, imageUrl2, promotionImages }) => {
  return (
    <div className="container mx-auto p-4">
      <div className="relative flex flex-col md:flex-row h-auto md:h-[170px] lg:h-[250px]">
        {/* Left Section - Static Image 1 */}
        <div className="hidden md:flex w-full md:w-1/4 overflow-hidden bg-[#F5E0E5] p-4 md:p-6 lg:p-8 items-center justify-center">
          <img
            src={imageUrl1}
            alt="Static Left"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Middle Section - Swiper Slider */}
        <div className="w-full md:w-2/4 relative flex items-center justify-center p-4 md:p-6 lg:p-8">
          <div className="w-full h-full"> {/* Add a wrapper div to constrain Swiper */}
            <Swiper
              spaceBetween={30}
              centeredSlides={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
              }}
              navigation={false}
              modules={[Autoplay, Pagination, Navigation]}
              className="w-full h-full" // Ensure Swiper takes full width and height
            >
              {promotionImages.map((promo, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-full"> {/* Ensure slide takes full width and height */}
                    <img
                      src={promo}
                      alt={`Promotion ${index + 1}`}
                      className="object-cover w-full h-full rounded-md" // Ensure image fills the slide
                    />
                    {/* Optional Text Overlay on Each Slide */}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-center p-4">
                      <h2
                        className="text-2xl md:text-4xl lg:text-5xl font-bold text-white"
                        style={{
                          fontFamily: "Poppins",
                        }}
                      >
                        Experience the Difference
                      </h2>
                      <p
                        className="text-sm md:text-lg lg:text-xl mt-2 text-white"
                        style={{
                          fontFamily: "Poppins",
                        }}
                      >
                        Discover our unique offerings and enjoy unmatched experiences that
                        redefine your expectations. Step into a world of excellence.
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Right Section - Static Image 2 */}
        <div className="hidden md:flex w-full md:w-1/4 overflow-hidden bg-[#F5E0E5] p-4 md:p-6 lg:p-8 items-center justify-center">
          <img
            src={imageUrl2}
            alt="Static Right"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default HomeSection;