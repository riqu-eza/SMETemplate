import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { useState } from "react";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(true);

  const handleCheckout = async () => {
    navigate("/checkout");
  };

  const closeCart = () => {
    setIsCartOpen(false);
    navigate(-1);
  };

  return (
    <div>
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <div
            className="fixed top-0 right-0 h-full bg-white shadow-lg w-full md:w-[400px] 
                       transform transition-transform duration-300 ease-in-out translate-x-0"
          >
            <button onClick={closeCart} className="absolute top-2 right-2 text-red-500 text-xl">
              <FiX />
            </button>
            <h1 className="text-[#383838] font-semibold text-[24px] py-2 border-b border-gray-300 shadow-sm">
              Your Cart
            </h1>

            <div className="h-full overflow-y-auto p-4">
              {cart.length === 0 ? (
                <p className="text-blue-400 text-center text-2xl py-20">Your cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="flex bg-gray-100 rounded-md shadow-md my-4 p-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover border border-gray-300 rounded-md"
                    />
                    <div className="ml-4 flex-1 flex flex-col justify-between">
                      <p className="text-lg font-semibold">{item.name} ({item.selectedVariant})</p>
                      <p className="text-black">
                        Price: <span className="text-green-500 font-bold">Ksh{item.price}</span>
                      </p>
                      <div className="flex items-center">
                        <button onClick={() => updateQuantity(item.productId, item.selectedVariant, 1)}>+</button>
                        <span className="px-4">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.selectedVariant, -1)}>-</button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.productId, item.selectedVariant)} className="text-red-500 text-sm font-bold">
                      Remove
                    </button>
                  </div>
                ))
              )}
              <button onClick={handleCheckout} className="block w-full bg-blue-500 text-white rounded-md mt-4 py-2">
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
