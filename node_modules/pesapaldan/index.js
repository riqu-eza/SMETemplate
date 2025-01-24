// File: lib/pesapalPlugin.js

import { fetchToken } from "./lib/token.js";
import { registerIPN } from "./lib/ipn.js";
import { submitOrderRequest } from "./lib/order.js";
import { verification } from "./lib/verification.js";

class PesaPalPlugin {
  constructor(config) {
    if (!config.consumerKey || !config.consumerSecret) {
      throw new Error("Consumer key and secret are required");
    }

    this.consumerKey = config.consumerKey;
    this.consumerSecret = config.consumerSecret;
    this.ipnUrl = config.ipnUrl || "";
    this.jwtToken = null;
    this.ipnId = null;
    this.orderTrackingId = null;
    this.redirectUrl = null; // Placeholder for the redirect URL
  }

  // Initialize the plugin and fetch a JWT token
  async initialize() {
    this.jwtToken = await fetchToken(this.consumerKey, this.consumerSecret);
    console.log("Plugin initialized.");
  }

  // Register the IPN and retrieve its ID
  async registerIPN() {
    if (!this.jwtToken) throw new Error("Token not available. Initialize first.");
    this.ipnId = await registerIPN(this.jwtToken, this.ipnUrl);
    console.log("IPN registered.");
  }

  // Submit an order request and handle the redirect URL
  async submitOrder(orderData) {
    if (!this.jwtToken || !this.ipnId) {
      throw new Error("Ensure token and IPN ID are available.");
    }
  
    const response = await submitOrderRequest(this.jwtToken, orderData, this.ipnId);
    console.log("response", response);
  
    this.orderTrackingId = response.order_tracking_id;
    this.redirectUrl = response.redirect_url;
  
    console.log(`Order submitted. Tracking ID: ${this.orderTrackingId}`);
    console.log(`Redirect URL: ${this.redirectUrl}`);
  
    // Return the redirect URL for frontend handling
    return {
      trackingId: this.orderTrackingId,
      redirectUrl: this.redirectUrl,
    };;
  }
  
  

  // Verify the transaction status
  async verifyTransaction(orderTrackingId) {
    if (!this.jwtToken) {
      throw new Error("Ensure token is available.");
    }
    if (!orderTrackingId) {
      throw new Error("OrderTrackingId is required for verification.");
    }
    return await verification(this.jwtToken, orderTrackingId);
  }
}

export default PesaPalPlugin;
