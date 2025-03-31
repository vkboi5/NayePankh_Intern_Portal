import { useEffect, useState } from "react";
import { Typography, Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

const DonationSuccess = () => {
  const [status, setStatus] = useState("Verifying payment...");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const merchantTransactionId = localStorage.getItem("merchantTransactionId");
      if (!merchantTransactionId) {
        setStatus("No transaction ID found. Redirecting...");
        setTimeout(() => navigate("/donate"), 3000);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/donate/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ merchantTransactionId }),
        });

        const data = await response.json();
        if (response.ok) {
          setStatus("Thank you for your donation! Payment verified successfully.");
          localStorage.removeItem("merchantTransactionId");
          setTimeout(() => navigate("/donate"), 3000);
        } else {
          setStatus(`Payment verification failed: ${data.msg}. Redirecting...`);
          setTimeout(() => navigate("/donate"), 3000);
        }
      } catch (err) {
        setStatus("Error verifying payment. Redirecting...");
        setTimeout(() => navigate("/donate"), 3000);
      }
    };

    verifyPayment();
  }, [navigate]);

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {status}
      </Typography>
      <CircularProgress />
    </Box>
  );
};

export default DonationSuccess;