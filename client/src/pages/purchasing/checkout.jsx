import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { io } from "socket.io-client";

const Checkout = () => {
  const { productId, userId, orderId } = useParams();
  const { currentUser } = useUser();
  const [orderItems, setOrderItems] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [order, setOrder] = useState([]);
  const [completePayment, setCompletePayment] = useState(null); // New state to hold payment details
  // const [statusCode, setStatusCode] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const [ordertrackingid, setordertrackingid] = useState("");
  const [email, setEmail] = useState(currentUser ? currentUser.email : "");
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

  const [step, setStep] = useState("order"); // Initial step is 'Order'
  const [loading, setLoading] = useState(false);
  // const [successMessage, setSuccessMessage] = useState(""); // New state for success message

  // eslint-disable-next-line no-unused-vars
  const [paymentStatus, setPaymentStatus] = useState(null);
  const SOCKET_URL =
  // eslint-disable-next-line no-undef
  process.env.NODE_ENV === "production"
    ? "https://smetemplate.xyz/"
    : "http://localhost:3003";


  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email);
      setFormData((prev) => ({ ...prev, email: currentUser.email }));
    } else {
      setEmail(""); // Reset email if there's no current user
      setFormData((prev) => ({ ...prev, email: "" }));
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      if (productId && userId) {
        const productResponse = await fetch(
          `/api/listing/products/${productId}`
        );
        const product = await productResponse.json();
        setOrderItems([{ ...product, quantity: 1 }]);
      } else if (orderId) {
        const orderResponse = await fetch(`/api/order/getorder/${orderId}`);
        const orderData = await orderResponse.json();
        setOrderItems(orderData.items);
        setTotalPrice(orderData.totalPrice);
      }
    };
    fetchData();
  }, [productId, userId, orderId]);

  const updateQuantity = (id, increment) => {
    setOrderItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + increment } : item
      )
    );
  };
  useEffect(() => {
    if (!ordertrackingid) return;

    const socket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      timeout: 5000, // 5 seconds timeout
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

    // Cleanup on unmount
    return () => {
      console.log("Socket disconnecting...");
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordertrackingid,]);

  useEffect(() => {
    const total = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
    setFormData((prev) => ({ ...prev, totalPrice: total }));
  }, [orderItems]);

  const handleDiscountApply = async () => {
    const response = await fetch(`/api/discounts/${discountCode}`);
    const discountData = await response.json();
    setDiscount(discountData.amount);
    setFormData((prev) => ({ ...prev, discount: discountData.amount }));
  };

  const Pay = async (orderId) => {
    try {
      const paymentResponse = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, formData }),
      });

      if (!paymentResponse.ok)
        throw new Error("Payment failed. Please try again.");

      const { success, trackingId, redirectUrl, order_tracking_id } =
        await paymentResponse.json();

      if (success && redirectUrl) {
        window.open(redirectUrl, "_blank");
      }

      setordertrackingid(trackingId);

      return { success, trackingId, order_tracking_id };
    } catch (error) {
      console.error("Payment error:", error.message);
      return { success: false, message: error.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const createdOrderId = await createOrder();
      if (!createdOrderId) return;

      const paymentSuccess = await processPayment(createdOrderId);
      if (!paymentSuccess) return;

      // if (!paymentSuccess) {
      //   setSuccessMessage("Payment initiation failed. Please try again.");
      //   return;
      // }
    } catch (error) {
      console.error("An error occurred:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create the order
  const createOrder = async () => {
    setStep("order");
    const formattedOrderItems = orderItems.map((item) => ({
      productId: item._id,
      quantity: item.quantity,
      price: item.price,
    }));

    const orderResponse = await fetch("/api/order/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderItems: formattedOrderItems,
        totalPrice,
        shipping,
        discount,
      }),
    });

    if (orderResponse.ok) {
      const orderData = await orderResponse.json();
      console.log("Order created successfully:", orderData);
      setOrder(orderData._id);
      return orderData._id; // Return the created order ID
    } else {
      console.error("Error creating order:", orderResponse.statusText);
      setLoading(false);
      return null;
    }
  };

  // Helper function to process the payment
  const processPayment = async (orderId) => {
    setStep("payment");

    const paymentResponse = await Pay(orderId); // Use the updated Pay function
    if (paymentResponse.success) {
      console.log("Payment succeeded:", paymentResponse);
      return true;
    } else {
      console.error("Payment failed. Aborting checkout process.");
      setLoading(false);
      return false;
    }
  };

  // Helper function to complete the checkout
  const completeCheckout = async (paymentDetails) => {
    setStep("checkout");
    const checkoutData = {
      ...formData,
      orderId,
      totalPrice,
      shipping,
      discount,
      orderItems,
      paymentDetails,
    };

    const checkoutResponse = await fetch("/api/order/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutData),
    });

    if (checkoutResponse.ok) {
      const responseData = await checkoutResponse.json();
      resetForm();
      console.log("Checkout completed successfully:", responseData);
    } else {
      console.error("Error during checkout:", checkoutResponse.statusText);
      setLoading(false);
    }
  };

  // Helper function to reset the form
  // eslint-disable-next-line no-unused-vars
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
    <>
      <div className="max-w-6xl mx-auto p-8 bg-white border border-gray-200 rounded shadow-md">
        <form className="flex">
          {/* Left Section: Delivery Details */}
          <div className="flex-1 pr-4">
            {/* Account Section */}
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
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }));
                  }}
                  required
                  className="w-full p-3 border border-gray-300 rounded"
                />
              )}
            </div>
            {/* Delivery Address Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Delivery Address</h3>
              <input
                type="text"
                placeholder="First Name"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded mb-2"
              />
              <input
                type="text"
                placeholder="First Name"
                required
                value={formData.middleName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    middleName: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded mb-2"
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded mb-2"
              />
              <input
                type="text"
                placeholder="Country"
                required
                value={formData.country}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    country: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded mb-2"
              />
              <input
                type="text"
                placeholder="County"
                required
                value={formData.county}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    county: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded mb-2"
              />
              <input
                type="text"
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
                placeholder="Address"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded mb-2"
              />
              <input
                type="text"
                placeholder="Postal Code"
                required
                value={formData.postalcode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    postalcode: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded mb-2"
              />
              <input
                type="text"
                placeholder="Phone Number"
                required
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded mb-2"
              />
            </div>
            {/* Shipping Method Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Shipping Method</h3>
              <select
                onChange={(e) => {
                  const shippingValue = e.target.value;
                  setShipping(shippingValue);
                  setFormData((prev) => ({
                    ...prev,
                    shipping: shippingValue,
                  }));
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
                    item.imageUrls && item.imageUrls.length > 0
                      ? item.imageUrls[0]
                      : "/fallback.jpg"
                  }
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded mr-4"
                />
                <div className="flex-grow">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-700">Ksh{item.price}</p>
                  <div className="flex items-center">
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    >
                      +
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <input
              type="text"
              value={discountCode}
              onChange={(e) => {
                setDiscountCode(e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  discountCode: e.target.value,
                }));
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
              type="button"
              onClick={handleSubmit}
              className={`bg-blue-600 text-white px-6 py-3 rounded ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loading} // Disable button when loading
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
    </>
  );
};

export default Checkout;
