import { useState } from "react";
import { Box, Typography, Container, TextField, Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Theme matching NayePankh Foundation and dashboard style
const theme = createTheme({
  palette: {
    primary: {
      main: "#ff9933", // Emerald Green
    },
    secondary: {
      main: "#F1C40F", // Sunflower Yellow
    },
    background: {
      default: "#ffe2c2", // Light gray for soothing effect
    },
    text: {
      primary: "#34495E", // Dark Slate
      secondary: "#607D8B", // Lighter slate for contrast
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h3: { fontWeight: 700 },
    body1: { fontWeight: 400 },
  },
});

function Feedback() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for form submission logic (e.g., API call)
    console.log("Feedback Submitted:", formData);
    // Reset form after submission
    setFormData({ name: "", email: "", message: "" });
    alert("Thank you for your feedback!");
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default", // Light gray background
          py: { xs: 4, md: 6 }, // Consistent padding with FAQ
          position: "relative",
          overflow: "hidden",
          borderRadius:5,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h1"
            sx={{
              textAlign: "center",
              color: "primary.main",
              fontSize: { xs: "2rem", md: "2.5rem" },
              fontWeight: 700,
              mb: 2,
              letterSpacing: "1px",
            }}
          >
            Share Your Feedback
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              fontSize: { xs: "1rem", md: "1.1rem" },
              mb: 6,
              lineHeight: 1.6,
            }}
          >
            We value your input! Let us know your thoughts to help us improve
            and better serve our community.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: 2,
              boxShadow: "0px 2px 10px rgba(0,0,0,0.05)",
              p: { xs: 3, md: 4 },
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            {/* Your Name */}
            <TextField
              fullWidth
              label="Your Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                  "&:hover fieldset": { borderColor: "primary.main" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                },
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                  "&.Mui-focused": { color: "primary.main" },
                },
              }}
              required
            />

            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                  "&:hover fieldset": { borderColor: "primary.main" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                },
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                  "&.Mui-focused": { color: "primary.main" },
                },
              }}
              required
            />

            {/* Message */}
            <TextField
              fullWidth
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={4}
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                  "&:hover fieldset": { borderColor: "primary.main" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                },
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                  "&.Mui-focused": { color: "primary.main" },
                },
              }}
              required
            />

            {/* Submit Button */}
            <Box sx={{ textAlign: "center" }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: "#ffe2c2",
                  color: "#ff9933",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  borderRadius: 50,
                  py: 1.5,
                  px: 6,
                  fontSize: { xs: "1rem", md: "1.25rem" },
                  boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "#ff9933", // Slightly darker green
                    color: "white",
                    transform: "scale(1.05)",
                    boxShadow: "0px 6px 20px rgba(0,0,0,0.15)",
                  },
                }}
              >
                Submit Feedback
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Feedback;
