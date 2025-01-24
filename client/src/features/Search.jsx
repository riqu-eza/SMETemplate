import { useLocation } from "react-router-dom";
import Header from "../components/header";
import { useEffect, useState } from "react";
import ProductCard from "../components/product";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchResult = () => {
  const query = useQuery();
  const searchQuery = query.get("query");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (searchQuery) {
        try {
          const response = await fetch(
            `/api/search/get?query=${searchQuery}`
          ); // Your API endpoint
          const data = await response.json();
          setResults(data);
          console.log('product', data) // Set the results from API
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      }
    };

    fetchData();
  }, [searchQuery]); // Run effect whenever searchQuery changes

  return (
    <>
      <Header />

      <div className="grid grid-cols-4 gap-4 ml-2 p-5">
        {results.length > 0 ? (
          results.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p>No products found for this category.</p>
        )}
      </div>
    </>
  );
};

export default SearchResult;
