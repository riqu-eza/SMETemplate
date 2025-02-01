import Checkout from "../Models/checkout.model.js";
import Order from "../Models/Order.model.js";
import { sendEmail } from "../utils/email.js";

export const createOrder = async (req, res, next) => {
  console.log(req.body);

  try {
    // Validate the request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is required" });
    }

    // Handle missing or invalid userId
    if (!req.body.userId || req.body.userId === "undefined" || req.body.userId === "null") {
      delete req.body.userId; // Remove userId to avoid validation errors
    } else if (!mongoose.Types.ObjectId.isValid(req.body.userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    // Create the order
    const order = await Order.create(req.body);
    console.log("Order saved:", order);

    return res.status(201).json(order); // Return created order with status 201
  } catch (err) {
    console.error("Error creating order:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", errors: err.errors });
    }

    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


export const getorder = async (req, res, next) => {
  try {
    const { orderId } = req.params; // Get the orderId from the request params

    // Fetch the order from the database using the orderId
    const order = await Order.findById(orderId);

    if (!order) {
      // If no order is found with the given ID, send a 404 error
      return res.status(404).json({ message: "Order not found" });
    }

    // If order is found, return it with a 200 status
    res.status(200).json(order);
  } catch (error) {
    // If there's an error (e.g., invalid orderId format), catch it and pass it to the error handler
    next(error);
  }
};

export const createCheckout = async (req, res, next) => {
  console.log("checkout", req.body);

  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is required" });
    }

    if (req.body.userId === "null") {
      delete req.body.userId;
    }

    // Fetch the complete order details
    const completeOrder = await Order.findById(req.body.orderId);
    console.log("completeOrder", completeOrder);

    if (!completeOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    let checkout;

    if (
      req.body.paymentDetails &&
      req.body.paymentDetails.payment_status_description === "no payment required"
    ) {
      // If no payment is required, create the order without payment details
      checkout = await Checkout.create({ ...req.body, paymentDetails: null });
      console.log("Checkout created without payment");
    } else {
      // If payment details are provided, update existing checkout
      checkout = await Checkout.findOneAndUpdate(
        { orderId: req.body.orderId },
        { $set: { paymentDetails: req.body.paymentDetails } },
        { new: true, upsert: true }
      );
      console.log("Checkout updated with payment details");
    }

    // Construct email body
    const emailBody = `
    <div style="background-color: #f9f9f9; padding: 30px; font-family: 'Arial', sans-serif; color: #333;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #4A90E2; text-align: center; font-size: 24px; margin-bottom: 20px;">Your LSkin Order Confirmation</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${req.body.firstName} ${req.body.lastName}</strong>,</p>
            <p style="font-size: 16px; margin-bottom: 20px;">Thank you for shopping with LSkin! Your order has been successfully confirmed. Here are your order details:</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="background-color: #f4f4f9;">
                    <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Item</th>
                    <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Price</th>
                    <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Quantity</th>
                    <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Total</th>
                </tr>
                ${completeOrder.items
                  .map(
                    (item) => `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">Ksh${item.price}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">Ksh${item.price * item.quantity}</td>
                    </tr>
                  `
                  )
                  .join("")}
            </table>
            <p style="font-size: 16px; margin-bottom: 10px;"><strong>Order ID:</strong> ${completeOrder._id}</p>
            <p style="font-size: 16px; margin-bottom: 10px;"><strong>Total Cost:</strong> Ksh${completeOrder.totalPrice}</p>
            ${
              req.body.paymentDetails
                ? `
                <p style="font-size: 16px; margin-bottom: 10px;"><strong>Payment Account:</strong> ${req.body.paymentDetails.payment_account}</p>
                <p style="font-size: 16px; margin-bottom: 10px;"><strong>Payment Status:</strong> ${req.body.paymentDetails.payment_status_description}</p>
                <p style="font-size: 16px; margin-bottom: 10px;"><strong>Payment Confirmation code:</strong> ${req.body.paymentDetails.confirmation_code}</p>
                `
                : "<p style='font-size: 16px; margin-bottom: 10px; color: red;'><strong>Note:</strong> No payment required for this order.</p>"
            }
            <p style="font-size: 16px; margin-bottom: 20px;">Items will be delivered to:</p>
            <p style="font-size: 16px; color: #4A90E2; margin-bottom: 30px;">
                ${req.body.address}, ${req.body.city}, ${req.body.country}
            </p>
            <p style="font-size: 16px;">Thank you for your order! If you have any questions, feel free to contact us.</p>
            <p style="font-size: 16px; text-align: center; margin-top: 30px; color: #4A90E2;">
                Best regards,<br>LSkin Team
            </p>
        </div>
    </div>
    `;

    await sendEmail(req.body.email, "Your LSkin Order Confirmation", emailBody);

    console.log("saved", checkout);
    return res.status(201).json(checkout);
  } catch (err) {
    console.error("Error creating order:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", errors: err.errors });
    }

    if (err.name === "MongoError" && err.code === 11000) {
      return res.status(409).json({ message: "Duplicate key error" });
    }

    return res.status(500).json({ message: "An unexpected error occurred", error: err.message });
  }
};


export const checkout = async (req, res, next) => {
  try {
    const order = await Checkout.find();
    res.status(200).json(order);
  } catch (e) {
    next(e);
  }
};
