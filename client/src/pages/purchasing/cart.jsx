import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiX } from "react-icons/fi";

const Cart = () => {
  const { productId, userId } = useParams();
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(true); // Open the cart by default

  // Fetch product details and add it to order when component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      const response = await fetch(`/api/listing/products/${productId}`);
      const product = await response.json();
      addProductToOrder(product);
    };

    if (productId) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Load cart from local storage when component mounts
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setOrderItems(storedCart);
  }, []);
  // Save cart to local storage whenever orderItems changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(orderItems));
    const total = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [orderItems]);

  // Add product to order items
  const addProductToOrder = (product) => {
    const newItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      imageUrls: product.imageUrls,
      quantity: 1,
    };

    const existingItem = orderItems.find((item) => item.id === product._id);
    if (existingItem) {
      updateQuantity(product._id, 1);
    } else {
      setOrderItems((prevItems) => [...prevItems, newItem]);
    }
  };

  // Update quantity of a product in the cart
  const updateQuantity = (id, increment) => {
    setOrderItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + increment }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove product from cart
  const removeProduct = (id) => {
    setOrderItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Handle checkout and send order data to backend

  const handleCheckout = async () => {
    const order = {
      userId,
      items: orderItems,
      totalPrice,
    };
    try {
      const response = await fetch("/api/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        const orderData = await response.json();
        console.log("orderData", orderData);
        navigate(`/checkout/${orderData._id}`);
        console.log("orderid", orderData._id);
        setOrderItems([]);
        localStorage.removeItem("cart");
      } else {
        console.error("Error placing order");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  // Close the cart
  const closeCart = () => {
    setIsCartOpen(false);
    navigate(-1);
  };

  return (
    <div>
  {isCartOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
      {/* Animated Cart Container */}
      <div
        className="fixed top-0 right-0 h-full bg-white shadow-lg w-full md:w-[400px] 
                   transform transition-transform duration-300 ease-in-out translate-x-0"
      >
        <button
          onClick={closeCart}
          className="absolute top-2 right-2 text-red-500 text-xl"
        >
          <FiX />
        </button>
        <h1 className="text-[#383838] font-[Poppins] font-semibold text-[24px] py-2 border-b border-gray-300 shadow-sm">
          Your Cart
        </h1>

        {/* Cart Content */}
        <div className="h-full overflow-y-auto p-4">
          {orderItems.length === 0 ? (
            <p className="text-blue-400 text-center text-2xl py-20">
              Your cart is empty.
            </p>
          ) : (
            orderItems.map((item) => (
              <div
                key={item.id}
                className="flex bg-gray-100 rounded-md shadow-md my-4 p-2"
              >
                {/* Product Image */}
                <img
                  src={
                    item.imageUrls && item.imageUrls.length > 0
                      ? item.imageUrls[0]
                      : "/fallback.jpg"
                  }
                  alt={item.name}
                  className="w-24 h-24 object-cover border border-gray-300 rounded-md"
                />

                {/* Product Details */}
                <div className="ml-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-lg font-semibold">{item.name}</p>
                    <p className="text-black">
                      Price:{" "}
                      <span className="text-green-500 font-bold">
                        Ksh{item.price}
                      </span>
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center">
                    <button
                      className="text-lg font-bold text-gray-700"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      +
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button
                      className="text-lg font-bold text-gray-700"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      -
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeProduct(item.id)}
                  className="text-red-500 text-sm font-bold self-start"
                >
                  Remove
                </button>
              </div>
            ))
          )}

          {/* Total Price and Checkout */}
          <h2 className="mt-6 text-xl font-bold text-center">
            Total Amount:{" "}
            <span className="text-green-500">Ksh{totalPrice}</span>
          </h2>
          <button
            onClick={handleCheckout}
            className="block w-full bg-blue-500 text-white rounded-md mt-4 py-2 text-center font-semibold hover:bg-blue-600"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  )}
</div>

  );
};

export default Cart;
