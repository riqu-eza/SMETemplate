/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import "./home.css";
import ProductListing from "./Productfilter";

const Home = ({ setFooterData }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // Selected category ID
  // eslint-disable-next-line no-unused-vars
  const { currentUser } = useUser();
  const imageUrl = "/rectangle3.png"; // Changed to a single string for backgroundImage

  const fetchData = async () => {
    try {
      const response = await fetch("/api/listing/getlisting");
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setFooterData(data);
      // Extract categories and their products
      const extractedCategories = data.flatMap((shop) =>
        shop.categories.map((category) => ({
          id: category._id,
          name: category.name,
          products: category.products,
        }))
      );

      setCategories(extractedCategories);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedCategoryData = categories.find(
    (cat) => cat.id === selectedCategory
  );

  return (
    <>
      {/* Hero Section */}
      <div className="relative flex flex-col md:flex-row h-auto md:h-[130px] lg:h-[170px]">
        <div className="w-full md:w-1/4 overflow-hidden bg-[#F5E0E5] p-4 md:p-6 lg:p-8"></div>

        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none p-4 md:p-8">
          <div className="text-center">
            <h2
              className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight"
              style={{
                color: "#232629",
                fontFamily: "Poppins",
              }}
            >
              Experience the Difference
            </h2>
            <p
              className="text-sm md:text-lg lg:text-xl mt-2 leading-relaxed"
              style={{
                color: "#232629",
                fontFamily: "Poppins",
              }}
            >
              Discover our unique offerings and enjoy unmatched experiences that
              redefine your expectations. Step into a world of excellence.
            </p>
          </div>
        </div>

        <div
          className="flex-grow relative z-10 h-64 md:h-full"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
      </div>

      {/* Navbar for Categories */}
      <div className="p-2 m-2 bg-sky-50 border border-sky-200 rounded-md shadow">
      {/* Category Filter Bar */}
      <div className="bg-white p-2 border border-sky-200 rounded">
        <nav className="flex space-x-2 md:space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-sky-300 scrollbar-track-sky-100">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                flex-shrink-0 px-3 py-1 rounded text-xs md:text-sm transition-colors 
                ${
                  selectedCategory === category.id
                    ? "bg-sky-400 text-white shadow"
                    : "bg-sky-100 hover:bg-sky-200 text-sky-700"
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Products Listing */}
      <ProductListing
        categoryName={selectedCategoryData?.name}
        products={selectedCategoryData?.products || []}
      />
    </div>
    </>
  );
};

export default Home;
