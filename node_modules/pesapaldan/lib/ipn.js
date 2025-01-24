import fetch from "node-fetch";

export const registerIPN = async (jwtToken, ipnUrl, ipnType = "POST") => {
  const body = { url: ipnUrl, ipn_notification_type: ipnType };
console.log("ipn_url", ipnUrl, "token:", jwtToken )
  try {
    const response = await fetch(
      "https://pay.pesapal.com/v3/api/URLSetup/RegisterIPN",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log("IPN Registered successfully:", data);
      return data.ipn_id;
    } else {
      console.error("Error registering IPN:", data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Error during registerIPN:", error);
    throw error;
  }
};
