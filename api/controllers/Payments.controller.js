import PesaPalPlugin from "pesapaldan";
import { getSocket } from "../Sockerserver.js";

export const processPayment = async (req, res, next) => {
  const { orderId, formData } = req.body;

  try {
    // Initialize the PesaPal plugin
    const plugin = new PesaPalPlugin({
      consumerKey: process.env.CONSUMER_KEY,
      consumerSecret: process.env.CONSUMER_SECRET,
      ipnUrl: process.env.IPN_URL,
    });

    await plugin.initialize();
    await plugin.registerIPN();

    // Submit the order to PesaPal
    const { trackingId, redirectUrl, order_tracking_id } =
      await plugin.submitOrder({
        id: orderId,
        currency: "KES",
        amount: formData.totalPrice,
        description: "Order payment",
        callback_url: process.env.CALLBACK_URL,
        billing_address: {
          email_address: formData.email,
          phone_number: formData.phoneNumber,
          county_code: "254",
          first_name: formData.firstName,
          middle_name: formData.middleName,
          last_name: formData.lastName,
          line_1: formData.address,
          line_2: formData.address,
          postal_code: formData.postalcode,
          zip_code: formData.postalcode,
        },
      });

    return res.status(200).json({
      success: true,
      trackingId,
      redirectUrl,
      order_tracking_id,
    });
  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment error",
      error: error.message,
    });
  }
};

export const callipn = async (req, res) => {
  const { OrderTrackingId, OrderNotificationType, OrderMerchantReference } = req.body;
  console.log("req.body", req.body);

  if (OrderNotificationType?.toUpperCase() === "IPNCHANGE") {
    const orderTrackingId = OrderTrackingId;

    try {
      // Retrieve Socket.IO instance dynamically
      const io = getSocket();

      io.emit(`paymentStatus:${orderTrackingId}`, {
        status: "verifying payment",
      });

      const plugin = new PesaPalPlugin({
        consumerKey: process.env.CONSUMER_KEY,
        consumerSecret: process.env.CONSUMER_SECRET,
      });

      await plugin.initialize();
      const verificationResult = await plugin.verifyTransaction(orderTrackingId);

      io.emit(`paymentStatus:${orderTrackingId}`, {
        ...verificationResult,
      });

      res.status(200).send("IPN processed successfully.");
    } catch (error) {
      console.error("Error processing IPN:", error.message);

      const io = getSocket();
      io.emit(`paymentStatus:${orderTrackingId}`, {
        status: "failed",
        message: error.message,
      });

      res.status(500).send("IPN processing error.");
    }
  } else {
    res.status(400).send("Unhandled IPN Notification Type.");
  }
};
