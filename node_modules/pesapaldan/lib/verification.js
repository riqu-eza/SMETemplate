// File: lib/verification.js

export const verification = async (jwtToken, orderTrackingId) => {
    const url = `https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`;
  console.log("orderTrackingId",orderTrackingId)
    try {
      const response = await fetch(url, {
        method: "GET", // Verify if POST is correct for this API; GET may be more typical for retrieval operations
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Transaction details retrieved successfully:", data);
        return data; // Contains transaction status and details
      } else {
        console.error("Error fetching transaction details:", data);
        throw new Error(data.message || "Failed to fetch transaction details");
      }
    } catch (error) {
      console.error("Error during transaction verification:", error.message || error);
      throw new Error("Unexpected error occurred during transaction verification");
    }
  };
  