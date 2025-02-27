import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  LinearProgress,
  Container,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FF9933", // Saffron
    },
    secondary: {
      main: "#138808", // Green
    },
    background: {
      default: "#FFF4E6", // Light saffron tint
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif", // Modern font
  },
});

const Donate = () => {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "", // Store only the numeric part (e.g., 1234567890), +91 will be prepended visually
    amount: "", // Amount in rupees, will be converted to paise
    campaignId: "",
  });
  const [errors, setErrors] = useState({}); // Track errors for each field
  const [success, setSuccess] = useState(false);
  const [openDonateDialog, setOpenDonateDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null); // Track selected campaign

  // Fetch campaigns using the referral code
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!referralCode || typeof referralCode !== "string" || !/^[A-Za-z0-9]+$/.test(referralCode)) {
        setErrors({ general: "Invalid referral code" });
        console.error("Invalid referral code:", referralCode);
        return;
      }

      try {
        console.log("Fetching campaigns for referralCode:", referralCode);
        const response = await fetch(`https://naye-pankh-intern-portal-backend.vercel.app/api/donate/${encodeURIComponent(referralCode)}`);
        const data = await response.json();
        if (response.ok) {
          setCampaigns(data.campaigns || []);
        } else {
          setErrors({ general: data.msg || "Failed to load campaigns" });
        }
      } catch (err) {
        setErrors({ general: "Failed to fetch campaigns" });
        console.error(err);
      }
    };

    fetchCampaigns();
  }, [referralCode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format phone number to 5-digit 5-digit format (e.g., 12345 67890)
    if (name === "phoneNumber") {
      // Remove any non-digit characters and limit to 10 digits
      formattedValue = value.replace(/\D/g, "").slice(0, 10);
      if (formattedValue.length > 5) {
        formattedValue = `${formattedValue.slice(0, 5)} ${formattedValue.slice(5, 10)}`;
      }
      // Store only the numeric part in state (without spaces or +91)
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue.replace(/\s/g, ""), // Store numeric part
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "", general: "" })); // Clear error for this field
  };

  const handleDonateClick = (campaignId) => {
    if (!campaignId || typeof campaignId !== "string") {
      setErrors({ general: "Invalid campaign selected" });
      return;
    }
    const campaign = campaigns.find((c) => c._id === campaignId);
    setSelectedCampaign(campaign); // Set the selected campaign
    setFormData((prev) => ({ ...prev, campaignId }));
    setOpenDonateDialog(true);
    setErrors({}); // Clear errors when opening dialog
  };

  const handleDonate = async (e) => {
    e.preventDefault();

    // Validate all fields inline
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone Number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number (starting with 6-9)";
    }
    const amountInINR = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amountInINR) || amountInINR <= 0) {
      newErrors.amount = "Please enter a valid donation amount greater than 0";
    }
    if (!formData.campaignId) newErrors.campaignId = "Please select a campaign";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const amountInPaise = Math.round(amountInINR * 100);

      const response = await fetch("https://naye-pankh-intern-portal-backend.vercel.app/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: formData.fullName,
          amount: amountInPaise, // Send in paise
          campaignId: formData.campaignId,
          referralCode,
          email: formData.email,
          phoneNumber: formData.phoneNumber.replace(/\s/g, ""), // Send numeric part
        }),
      });
      const orderData = await response.json();

      if (!response.ok) {
        setErrors({ general: orderData.msg });
        return;
      }

      const options = {
        key: "rzp_test_Mitv03aBlFFlQ0", // Your test Key ID
        amount: orderData.amount, // Already in paise from backend
        currency: "INR",
        name: "NayePankh",
        description: `Donation to ${selectedCampaign?.title || "Campaign"}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          const verifyResponse = await fetch("https://naye-pankh-intern-portal-backend.vercel.app/api/donate/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              donorName: formData.fullName,
              amount: amountInPaise, // Send in paise for verification
              campaignId: formData.campaignId,
              referralCode,
              email: formData.email,
              phoneNumber: formData.phoneNumber.replace(/\s/g, ""), // Send numeric part
            }),
          });
          const verifyData = await verifyResponse.json();

          if (verifyResponse.ok) {
            setSuccess(true);
            setFormData({
              fullName: "",
              email: "",
              phoneNumber: "",
              amount: "",
              campaignId: "",
            });
            setOpenDonateDialog(false);
            setErrors({});
            setSelectedCampaign(null); // Reset selected campaign
          } else {
            setErrors({ general: verifyData.msg });
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: `+91${formData.phoneNumber.replace(/\s/g, "")}`, // Display with +91
        },
        theme: {
          color: "#FF9933", // Match saffron theme
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setErrors({ general: "Failed to process donation" });
      console.error(err);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  const handleCloseDialog = () => {
    setOpenDonateDialog(false);
    setErrors({});
    setFormData((prev) => ({
      ...prev,
      fullName: "",
      email: "",
      phoneNumber: "",
      amount: "",
    }));
    setSelectedCampaign(null); // Reset selected campaign
  };

  if (errors.general) return <Typography sx={{ p: 4, textAlign: "center", color: "error.main" }}>{errors.general}</Typography>;
  if (!referralCode) return <Typography sx={{ p: 4, textAlign: "center", color: "error.main" }}>Invalid referral code</Typography>;
  if (campaigns.length === 0) return <Typography sx={{ p: 4, textAlign: "center" }}>Loading campaigns...</Typography>;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
        {/* About NayePankh Section */}
        <Box sx={{ p: 4, bgcolor: "white", boxShadow: "0px 6px 20px rgba(0,0,0,0.1)", mb: 6, borderRadius: 3, border: `2px solid ${theme.palette.primary.main}` }}>
          <Container maxWidth="md">
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                color: "primary.main",
                fontWeight: 700,
                textAlign: "center",
                textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                fontStyle: "italic",
              }}
            >
              About NayePankh
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.primary",
                lineHeight: 1.8,
                textAlign: "center",
                fontStyle: "italic",
                maxWidth: "800px",
                mx: "auto",
                fontSize: { xs: "0.9rem", md: "1rem" },
              }}
            >
              NayePankh is a platform dedicated to empowering communities through impactful campaigns. As part of the NayePankh Foundation, a distinguished NGO based in Noida, Uttar Pradesh, we are recognized by the government with 80G & 12A registration and featured in esteemed publications like The Pioneer, Dainik Jagran, and Hindustan. We engage with over 475 children across 10 shelter homes, 3 community centers, and 5 villages, fostering holistic growth and development. Join us in creating a brighter future for underprivileged children by supporting our campaigns!
            </Typography>
          </Container>
        </Box>

        {/* Hero Banner */}
        <Box
          sx={{
            height: "40vh",
            backgroundImage: "url(/assets/donate-hero.jpg)", // Replace with actual image
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 6,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.4))",
            }}
          />
          <Container maxWidth="md" sx={{ position: "relative", textAlign: "center", color: "white" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 3,
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                fontSize: { xs: "2rem", md: "3.5rem" },
              }}
            >
              Support Our Campaigns
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: "600px",
                mx: "auto",
                fontWeight: 300,
                fontSize: { xs: "1rem", md: "1.25rem" },
                mb: 3,
              }}
            >
              Choose a campaign below to make a donation and help make a difference.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 2,
                color: "white",
                fontWeight: 500,
                fontSize: "1.1rem",
                textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              Use Referral Code: <strong>{referralCode || "Not available"}</strong>
            </Typography>
          </Container>
        </Box>

        {/* Campaigns List */}
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {campaigns.map((campaign) => (
              <Grid item xs={12} sm={6} md={4} key={campaign._id}>
                <Card
                  sx={{
                    boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.15)",
                    borderRadius: 3,
                    bgcolor: "white",
                    border: `2px solid ${theme.palette.primary.main}`,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0px 12px 35px rgba(0, 0, 0, 0.25)",
                    },
                    mb: 6, // Add bottom space to campaign cards
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 3,
                        color: "primary.main",
                        fontWeight: 600,
                        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {campaign.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        lineHeight: 1.6,
                        fontStyle: "italic",
                        color: "text.secondary",
                      }}
                    >
                      {campaign.description}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      Goal: ₹{campaign.goalAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                      Raised: ₹{campaign.raisedAmount.toLocaleString()}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100) || 0}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: "grey.300",
                        "& .MuiLinearProgress-bar": { bgcolor: "secondary.main" },
                        mb: 3,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 3,
                        textAlign: "center",
                        color: "text.secondary",
                        fontWeight: 500,
                        textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.05)",
                      }}
                    >
                      {Math.round((campaign.raisedAmount / campaign.goalAmount) * 100) || 0}% of goal reached
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={() => handleDonateClick(campaign._id)}
                      sx={{
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        borderRadius: 2,
                        bgcolor: "primary.main",
                        "&:hover": {
                          bgcolor: "primary.dark",
                          transform: "scale(1.03)",
                        },
                        transition: "all 0.3s ease",
                        boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                      }}
                    >
                      Donate Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Donation Dialog */}
        <Dialog open={openDonateDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: "primary.main", color: "white", textAlign: "center", px: 2, py: 2, mb:2 }}>
            Make a Donation to {selectedCampaign?.title || "Selected Campaign"}
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Card
              sx={{
                boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.15)",
                borderRadius: 4,
                bgcolor: "white",
                border: `2px solid ${theme.palette.primary.main}`,
                transition: "transform 0.3s ease",
                p: 2, // Add padding to card
              }}
            >
              <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}> {/* Use flex for better alignment */}
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      error={!!errors.fullName}
                      helperText={errors.fullName}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": { borderColor: "primary.main" },
                          "&.Mui-focused fieldset": { borderColor: "primary.main" },
                          "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: "error.main" },
                        },
                        "& .MuiInputLabel-root": { color: "primary.main", textAlign: "center" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                        "& .MuiFormHelperText-root": { mt: 0.5, fontSize: "0.75rem", color: "error.main", textAlign: "center" },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      error={!!errors.email}
                      helperText={errors.email}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": { borderColor: "primary.main" },
                          "&.Mui-focused fieldset": { borderColor: "primary.main" },
                          "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: "error.main" },
                        },
                        "& .MuiInputLabel-root": { color: "primary.main", textAlign: "center" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                        "& .MuiFormHelperText-root": { mt: 0.5, fontSize: "0.75rem", color: "error.main", textAlign: "center" },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber ? `${formData.phoneNumber.slice(0, 5)} ${formData.phoneNumber.slice(5, 10) || ""}` : ""}
                      onChange={handleInputChange}
                      required
                      type="tel"
                      variant="outlined"
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1, color: "text.secondary", fontWeight: 500 }}>+91</Typography>,
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": { borderColor: "primary.main" },
                          "&.Mui-focused fieldset": { borderColor: "primary.main" },
                          "&.Mui-error .MuiOutlinedInput-notchedOutlet": { borderColor: "error.main" },
                        },
                        "& .MuiInputLabel-root": { color: "primary.main", textAlign: "center" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                        "& .MuiFormHelperText-root": { mt: 0.5, fontSize: "0.75rem", color: "error.main", textAlign: "center" },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Use Referral Code"
                      name="referralCode"
                      value={referralCode || ""}
                      disabled
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": { borderColor: "primary.main" },
                          "&.Mui-focused fieldset": { borderColor: "primary.main" },
                        },
                        "& .MuiInputLabel-root": { color: "primary.main", textAlign: "center" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                        "& .MuiInputBase-root": { bgcolor: "rgba(255,153,51,0.1)" },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Donation Amount (INR)"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      inputProps={{ min: 1, step: "0.01" }}
                      variant="outlined"
                      error={!!errors.amount}
                      helperText={errors.amount}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": { borderColor: "primary.main" },
                          "&.Mui-focused fieldset": { borderColor: "primary.main" },
                          "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: "error.main" },
                        },
                        "& .MuiInputLabel-root": { color: "primary.main", textAlign: "center" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                        "& .MuiFormHelperText-root": { mt: 0.5, fontSize: "0.75rem", color: "error.main", textAlign: "center" },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", p: 3 }}> {/* Increased padding for better spacing */}
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              color="primary"
              sx={{
                borderRadius: 2,
                py: 1.5,
                fontWeight: "bold",
                "&:hover": { bgcolor: "rgba(255,153,51,0.1)" },
                mr: 2, // Add margin for spacing
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDonate}
              variant="contained"
              color="primary"
              sx={{
                bgcolor: "primary.main",
                borderRadius: 2,
                py: 1.5,
                fontWeight: "bold",
                "&:hover": { bgcolor: "primary.dark", transform: "scale(1.03)" },
                transition: "all 0.3s ease",
              }}
            >
              Donate Now
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
            Thank you for your donation of ₹{formData.amount || "N/A"}!
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Donate;