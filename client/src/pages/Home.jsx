/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import "./home.css";

import Productfilter from "./Productfilter.jsx";
import HomeSection from "./Homesection.jsx";

const Home = ({ setFooterData }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // Selected category ID
  // eslint-disable-next-line no-unused-vars
  const { currentUser } = useUser();
  const imageUrl1 = "/home.jpeg"; // Replace with your actual image path
  const imageUrl2 = "/home.jpeg"; // Replace with your actual image path

  // Sample Promotion Images (Replace with your actual promotion image URLs)
  const promotionImages = [
    "/home.jpeg",
    "/home.jpeg",
    "/home.jpeg",
  ];

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
      <HomeSection
        imageUrl1={imageUrl1}
        imageUrl2={imageUrl2}
        promotionImages={promotionImages}
      />

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
        <Productfilter
          categoryName={selectedCategoryData?.name}
          products={selectedCategoryData?.products || []}
        />
      </div>
    </>
  );
};

export default Home;
