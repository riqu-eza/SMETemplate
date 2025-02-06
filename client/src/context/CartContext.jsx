/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";

// Create Cart Context
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load Cart from Local Storage on App Load
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  // Save Cart to Local Storage on Every Update
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add to Cart
  const addToCart = (product, selectedVariant) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.productId === product._id && item.selectedVariant === selectedVariant
      );

      if (existingItemIndex !== -1) {
        prevCart[existingItemIndex].quantity += 1;
        return [...prevCart];
      } else {
        return [
          ...prevCart,
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.imageUrls[0] || "/placeholder-image.png",
            selectedVariant,
            quantity: 1,
          },
        ];
      }
    });
  };

  // Remove Item from Cart
  const removeFromCart = (productId, selectedVariant) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.productId === productId && item.selectedVariant === selectedVariant))
    );
  };

  // Update Quantity
  const updateQuantity = (productId, selectedVariant, amount) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId && item.selectedVariant === selectedVariant
          ? { ...item, quantity: Math.max(item.quantity + amount, 1) }
          : item
      )
    );
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook to use Cart Context
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
