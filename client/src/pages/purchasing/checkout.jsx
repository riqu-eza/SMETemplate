import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { io } from "socket.io-client";
import { useCart } from "../../context/CartContext";

const Checkout = () => {
  const { currentUser } = useUser();
  const { cart, removeFromCart } = useCart();
  const [orderItems, setOrderItems] = useState(cart);
  const [orderId, setOrder] = useState("");
  const [completePayment, setCompletePayment] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const [ordertrackingid, setordertrackingid] = useState("");
  const [email, setEmail] = useState(currentUser ? currentUser.email : "");
  const [payOnOrder, setPayOnOrder] = useState(true);
  
  // Form data state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    country: "",
    county: "",
    city: "",
    address: "",
    postalcode: "",
    phoneNumber: "",
    email: currentUser ? currentUser.email : "",
    orderItems: [],
    totalPrice: 0,
    discount: 0,
    shipping: 0,
    discountCode: "",
  });
  
  const [step, setStep] = useState("order");
  const [loading, setLoading] = useState(false);
  const SOCKET_URL =
    // eslint-disable-next-line no-undef
    process.env.NODE_ENV === "production"
      ? "https://smetemplate.xyz/"
      : "http://localhost:3003";

  // Update email in state when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email);
      setFormData((prev) => ({ ...prev, email: currentUser.email }));
    } else {
      setEmail("");
      setFormData((prev) => ({ ...prev, email: "" }));
    }
  }, [currentUser]);

  // Fetch store settings to determine payment behavior
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const response = await fetch("/api/listing/getlisting");
        if (!response.ok) throw new Error("Failed to fetch store settings");
        const storeData = await response.json();
        if (storeData.length > 0) {
          setPayOnOrder(storeData[0].payonorder);
        }
      } catch (error) {
        console.error("Error fetching store settings:", error);
      }
    };
    fetchStoreSettings();
  }, []);

  // Setup socket for payment status updates
  useEffect(() => {
    if (!ordertrackingid) return;
    const socket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      timeout: 5000,
    });
    socket.on("connect", () => {
      console.log("Socket connected with ID:", socket.id);
    });
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      setStep("Unable to connect to payment services. Please try again later.");
    });
    const eventName = `paymentStatus:${ordertrackingid}`;
    socket.on(eventName, (data) => {
      if (!data) {
        console.warn("Received empty data for payment status update");
        return;
      }
      const { status_code, payment_method, ...rest } = data;
      setCompletePayment({ payment_method });
      if (status_code === 1) {
        setStep("Payment successful!");
        completeCheckout({ ...completePayment, ...rest });
      } else if (status_code === 2) {
        setStep("Payment failed. Please try again.");
      } else if (status_code === 3) {
        setStep("Payment reversed.");
      } else {
        console.warn("Unexpected status_code:", status_code);
      }
    });
    return () => {
      console.log("Socket disconnecting...");
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordertrackingid]);

  // Update total price based on cart items
  useEffect(() => {
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(total);
  }, [cart]);

  // Apply discount code
  const handleDiscountApply = async () => {
    try {
      const response = await fetch(`/api/discounts/${discountCode}`);
      const discountData = await response.json();
      setDiscount(discountData.amount);
      setFormData((prev) => ({ ...prev, discount: discountData.amount }));
    } catch (error) {
      console.error("Error applying discount:", error);
    }
  };

  // Process Payment
  const Pay = async (orderId) => {
    try {
      const paymentResponse = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, formData }),
      });
      if (!paymentResponse.ok)
        throw new Error("Payment failed. Please try again.");
      const { success, trackingId, redirectUrl } = await paymentResponse.json();
      if (success && redirectUrl) {
        window.open(redirectUrl, "_blank");
      }
      setordertrackingid(trackingId);
      return { success };
    } catch (error) {
      console.error("Payment error:", error.message);
      return { success: false, message: error.message };
    }
  };

  // Create Order
  const createOrder = async () => {
    setStep("order");
    const formattedOrderItems = cart.map((item) => ({
      name: item.name,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      selectedVariant: item.selectedVariant,
    }));
    const orderResponse = await fetch("/api/order/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: formattedOrderItems,
        totalPrice,
        shipping,
        discount,
      }),
    });
    if (orderResponse.ok) {
      const orderData = await orderResponse.json();
      console.log("Order created successfully:", orderData);
      setOrder(orderData._id);
      return orderData._id;
    } else {
      console.error("Error creating order:", orderResponse.statusText);
      setLoading(false);
      return null;
    }
  };

  // Clear the cart after successful checkout
  const clearCartAfterCheckout = () => {
    cart.forEach((item) => removeFromCart(item.productId, item.selectedVariant));
    console.log("Cart cleared after successful checkout.");
  };

  // Complete Checkout and clear cart on success
  const completeCheckout = async (paymentDetails) => {
    setStep("checkout");
    const checkoutData = {
      ...formData,
      orderId,
      totalPrice,
      shipping,
      discount,
      paymentDetails,
    };
    const checkoutResponse = await fetch("/api/order/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutData),
    });
    if (checkoutResponse.ok) {
      const responseData = await checkoutResponse.json();
      console.log("Checkout completed successfully:", responseData);
      clearCartAfterCheckout();
      resetForm();
    } else {
      console.error("Error during checkout:", checkoutResponse.statusText);
      setLoading(false);
    }
  };

  // Form submission handler (attached to the form's onSubmit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const createdOrderId = await createOrder();
      if (!orderId) return;
      if (payOnOrder) {
        const paymentSuccess = await Pay(createdOrderId);
        if (!paymentSuccess.success) return;
      }
      await completeCheckout();
    } catch (error) {
      console.error("An error occurred:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form values
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      middleName: "",
      country: "",
      county: "",
      city: "",
      address: "",
      postalcode: "",
      phoneNumber: "",
      email: currentUser ? currentUser.email : "",
      orderItems: [],
      totalPrice: 0,
      discount: 0,
      shipping: 0,
      discountCode: "",
    });
    setOrderItems([]);
    setTotalPrice(0);
    setShipping(0);
    setDiscount(0);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white border border-gray-200 rounded shadow-md">
      {/* Attach onSubmit to the form so that pressing Enter or clicking submit does not reload the page */}
      <form className="flex" onSubmit={handleSubmit}>
        {/* Left Section: Delivery Details */}
        <div className="flex-1 pr-4">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Account</h3>
            {currentUser ? (
              <p>Logged in as: {currentUser.email}</p>
            ) : (
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormData((prev) => ({ ...prev, email: e.target.value }));
                }}
                required
                className="w-full p-3 border border-gray-300 rounded"
              />
            )}
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Delivery Address</h3>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              required
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded mb-2"
            />
            <input
              type="text"
              name="middleName"
              placeholder="Middle Name"
              required
              value={formData.middleName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, middleName: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded mb-2"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              required
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded mb-2"
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              required
              value={formData.country}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, country: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded mb-2"
            />
            <input
              type="text"
              name="county"
              placeholder="County"
              required
              value={formData.county}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, county: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded mb-2"
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              required
              value={formData.city}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, city: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded mb-2"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              required
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded mb-2"
            />
            <input
              type="text"
              name="postalcode"
              placeholder="Postal Code"
              required
              value={formData.postalcode}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, postalcode: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded mb-2"
            />
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              required
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded mb-2"
            />
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Shipping Method</h3>
            <select
              onChange={(e) => {
                const shippingValue = e.target.value;
                setShipping(shippingValue);
                setFormData((prev) => ({ ...prev, shipping: shippingValue }));
              }}
              className="w-full p-3 border border-gray-300 rounded"
            >
              <option value="10">Standard - Ksh10</option>
              <option value="20">Express - Ksh20</option>
            </select>
          </div>
        </div>

        {/* Right Section: Order Summary */}
        <div className="flex-1 pl-4">
          <h3 className="text-lg font-semibold mb-4">Your Order</h3>
          {orderItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center border border-gray-200 py-4 mb-4"
            >
              <img
                src={
                  item.image && item.image.length > 0
                    ? item.image
                    : "/fallback.jpg"
                }
                alt={item.name}
                className="w-20 h-20 object-cover rounded mr-4"
              />
              <div className="flex-grow">
                <p className="font-semibold">{item.name}</p>
                <p className="text-gray-700">Ksh{item.price}</p>
              </div>
            </div>
          ))}
          <input
            type="text"
            value={discountCode}
            onChange={(e) => {
              setDiscountCode(e.target.value);
              setFormData((prev) => ({ ...prev, discountCode: e.target.value }));
            }}
            placeholder="Discount Code"
            className="w-full p-3 border border-gray-300 rounded mb-2"
          />
          <button
            type="button"
            onClick={handleDiscountApply}
            className="bg-green-500 text-white px-4 py-2 rounded mb-4"
          >
            Apply Discount
          </button>
          <div className="mb-4">
            <p>Total: Ksh {totalPrice}</p>
            <p>Discount: Ksh {discount}</p>
            <p>Shipping: Ksh {shipping}</p>
            <p className="font-bold">
              Grand Total: Ksh {totalPrice - discount + Number(shipping)}
            </p>
          </div>
          <button
            type="submit"
            className={`bg-blue-600 text-white px-6 py-3 rounded ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading
              ? step === "order"
                ? "Creating Order..."
                : step === "payment"
                ? "Processing Payment..."
                : step === "checkout"
                ? "Completing Checkout..."
                : "Placing Order"
              : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
