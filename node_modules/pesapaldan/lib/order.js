import fetch from "node-fetch";

export const submitOrderRequest = async (jwtToken, orderData, ipnId) => {
  const payload = { ...orderData, notification_id: ipnId };

  try {
    const response = await fetch(
      "https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log("Order submitted successfully:", data);
      return data;

    } else {
      console.error("Error submitting order:", data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Error during submitOrderRequest:", error);
    throw error;
  }
};
