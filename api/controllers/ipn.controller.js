export const ipnreat = async (req, res, next)=>{
   const wellness = req.body
   console.log("we got you",wellness)

    if (wellness ) {
        // Here, you can store transaction details in your database
        // Example: await insertTransaction(merchantReference, transactionTrackingId);

        // Optionally, query Pesapal for the payment status if needed
        // Example: const status = await queryPaymentStatus(transactionTrackingId);

        // Redirect user to a success page
        res.redirect('http://localhost:6054/profile/'); // Replace with your success page URL
    } else {
        // Redirect user to a failure page if parameters are missing
        res.redirect('/failure'); // Replace with your failure page URL
    }
}

