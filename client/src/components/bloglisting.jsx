import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { Link } from "react-router-dom";

const BlogComponent = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/blog/getall");
        if (!response.ok) {
          throw new Error(`Failed to fetch blogs: ${response.status}`);
        }
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error("Error fetching blogs:", error.message);
        setError("Failed to fetch blogs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const truncateContent = (content) => {
    return content?.split(" ").slice(0, 14).join(" ") + "...";
  };

  const handleLearnMore = (blog) => {
    setSelectedBlog(blog);
  };

  const closeModal = () => {
    setSelectedBlog(null);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    if (selectedBlog) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBlog]);

  if (isLoading) {
    return (
      <div className="text-gray-500 text-center mt-10">Loading blogs...</div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="mx-auto px-1 py-4 ">
      <div className="text-center">
        <h1 className="text-[24px] font-[Poppins] font-bold text-center text-[#383838] ">
          Our Blogs
        </h1>
        <Link
          to="/blog"
          className="text-[#697586] font-[Poppins] text-[18px ] text-center hover:text-[#F5A3B7] "
        >
          see all
        </Link>
      </div>
      {/* Swiper to show responsive slides */}
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={3}
        slidesPerGroup={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          0: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="w-full"
      >
        {blogs.map((blog) => (
          <SwiperSlide key={blog._id} className="p-2">
            <div className="border rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-2xl transition-shadow duration-300">
              {/* Swiper for Blog Images */}
              <div className="h-40 overflow-hidden">
                {Array.isArray(blog.imageUrls) && blog.imageUrls.length > 0 ? (
                  blog.imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url.trim()}
                      alt={`blog-${index}`}
                      className="w-full h-40 object-cover"
                    />
                  ))
                ) : (
                  <img
                    src="/fallback.jpg"
                    alt="fallback"
                    className="w-full h-40 object-cover"
                  />
                )}
              </div>

              {/* Blog Content */}
              <div className="p-4">
                <h2 className="text-[18px] font-bold font-[Poppins] mb-1 hover:text-[#F5A3B7] ">
                  {blog.title || "Untitled Blog"}
                </h2>
                <p className="text-[#383838] text-[16px] font-[Montserrat] mb-4">
                  {truncateContent(blog.content || "No content available.")}
                </p>
                <button
                  onClick={() => handleLearnMore(blog)}
                  className="bg-[#FFFFFF] text-[#383838] border border-1 px-4 py-2 rounded-md hover:bg-[#252525] hover:text-[#FFFFFF] transition-all"
                >
                  Learn More
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Modal for displaying full content */}
      {selectedBlog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-4xl h-[90%] overflow-y-auto relative md:w-[80%] lg:w-[60%]"
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-[24px] font-bold mb-4">{selectedBlog.title}</h2>
            <div className="h-40 overflow-hidden mb-4">
              {Array.isArray(selectedBlog.imageUrls) &&
              selectedBlog.imageUrls.length > 0 ? (
                selectedBlog.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url.trim()}
                    alt={`blog-${index}`}
                    className="w-full h-40 object-cover"
                  />
                ))
              ) : (
                <img
                  src="/fallback.jpg"
                  alt="fallback"
                  className="w-full h-40 object-cover"
                />
              )}
            </div>
            <p className="text-[#383838] text-[16px] font-[Montserrat]">
              {selectedBlog.content || "No content available."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogComponent;
