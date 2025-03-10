import PesaPalPlugin from "pesapaldan";
import { getSocket } from "../Sockerserver.js";

// Process payment (multi-tenancy)
export const processPayment = async (req, res, next) => {
  const { orderId, formData } = req.body;

  try {
    // Fetch tenant-specific configuration from req.models or req.user.connection
    const { PaymentConfig } = req.models; // Assuming you have a model for tenant-specific payment configs

    // Retrieve the consumer keys and IPN URL for the tenant
    const paymentConfig = await PaymentConfig.findOne({ tenantId: req.user.tenantId });
    if (!paymentConfig) {
      return res.status(400).json({
        success: false,
        message: "Payment configuration not found for this tenant.",
      });
    }

    // Initialize the PesaPal plugin with the tenant-specific keys
    const plugin = new PesaPalPlugin({
      consumerKey: paymentConfig.consumerKey,
      consumerSecret: paymentConfig.consumerSecret,
      ipnUrl: paymentConfig.ipnUrl,
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
        callback_url: paymentConfig.callbackUrl,
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

// Handle IPN callback (multi-tenancy)
export const callipn = async (req, res) => {
  const { OrderTrackingId, OrderNotificationType, OrderMerchantReference } = req.body;
  console.log("req.body", req.body);

  if (OrderNotificationType?.toUpperCase() === "IPNCHANGE") {
    const orderTrackingId = OrderTrackingId;

    try {
      // Retrieve the socket instance dynamically for the tenant
      const io = getSocket();

      io.emit(`paymentStatus:${orderTrackingId}`, {
        status: "verifying payment",
      });

      // Fetch tenant-specific payment configuration
      const { PaymentConfig } = req.models; // Assuming you have a PaymentConfig model
      const paymentConfig = await PaymentConfig.findOne({ tenantId: req.user.tenantId });

      if (!paymentConfig) {
        return res.status(400).json({ message: "Payment configuration not found for tenant" });
      }

      // Initialize the PesaPal plugin with the tenant-specific keys
      const plugin = new PesaPalPlugin({
        consumerKey: paymentConfig.consumerKey,
        consumerSecret: paymentConfig.consumerSecret,
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
