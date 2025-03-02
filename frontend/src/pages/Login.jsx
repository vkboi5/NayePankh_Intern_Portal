import { useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Link,
  Grid,
  Container,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import loginImage from "../assets/login-bgm.jpg"; // Replace with your image path

const theme = createTheme({
  palette: {
    primary: {
      main: "#216eb6", // Logo-matching blue
    },
    secondary: {
      main: "#42A5F5", // Lighter blue
    },
    background: {
      default: "#E3F2FD", // Very light blue background
    },
    text: {
      primary: "#263238", // Darker gray
      secondary: "#546E7A", // Softer gray
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif", // Modern font
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://naye-pankh-intern-portal-ox93.vercel.app/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      console.log(data.token);
      if (response.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";
      } else {
        console.error(data.msg);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 2, sm: 4 },
        }}
      >
        <Container maxWidth="md">
          <Card
            sx={{
              maxWidth: { xs: 400, sm: 800 }, // Wider on mobile and desktop
              width: "100%",
              boxShadow: "0px 8px 25px rgba(0,0,0,0.15)", // Enhanced shadow
              borderRadius: 3, // More rounded corners
              overflow: "hidden", // Ensure image doesn't overflow
              display: "flex",
              flexDirection: { xs: "column", md: "row" }, // Stack on mobile, side-by-side on desktop
              mx: "auto", // Center the card
            }}
          >
            {/* Image Section (integrated within the card, slightly wider) */}
            <Box
            sx={{
            flex: { md: 1.2 }, // Slightly wider (1.2 instead of 1) on desktop
            backgroundImage: { 
                xs: `linear-gradient(rgba(245, 249, 255, 0.2), rgba(245, 249, 255, 0.2)), url(${loginImage})`,
                sm: `url(${loginImage})`
            },
            backgroundSize: "cover", // Use cover on all devices for better fill
            backgroundPosition: { xs: "center 50%", md: "center" }, // Adjusted position to better show the little girl
            backgroundRepeat: "no-repeat",
            backgroundColor: "#f5f9ff", // Light background color to complement the image
            minHeight: { xs: 260, sm: 400 }, // Slightly increased height on mobile
            display: "block", // Show on all devices
            borderBottom: { xs: "4px solid #216eb6", md: "none" }, // Add border on mobile for separation
            transition: "background-position 0.3s ease", // Smooth transition for position changes
            backgroundAttachment: { xs: "local", sm: "scroll" }, // Helps with mobile display
            }}
            />
            {/* Form Section */}
            <Box
              sx={{
                flex: { md: 1 }, // Half width on desktop, adjusted for image width
                p: { xs: 2, sm: 4 },
              }}
            >
              <Box
                sx={{
                  p: { xs: 2, sm: 3 },
                  textAlign: "center",
                  bgcolor: "primary.main", // Primary blue header
                  borderRadius: 10,
                  mb: { xs: 2, sm: 3 }, // Added margin for better spacing
                }}
              >
                <Typography
                  variant="body1" // Smaller text for "Sign In"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.2)", // Subtle shadow for depth
                    fontSize: { xs: "1rem", sm: "1.6rem" },
                    fontStyle: "italic", // Stylish touch
                  }}
                >
                  Sign In
                </Typography>
              </Box>
              <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                <Box component="form" onSubmit={handleLogin}>
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        variant="outlined"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        type="email"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": { borderColor: "primary.main" },
                            "&.Mui-focused fieldset": {
                              borderColor: "primary.main",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "primary.main",
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "primary.main",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        variant="outlined"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        type="password"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": { borderColor: "primary.main" },
                            "&.Mui-focused fieldset": {
                              borderColor: "primary.main",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "primary.main",
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "primary.main",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{
                          py: { xs: 1, sm: 1.5 },
                          fontSize: { xs: "1rem", sm: "1.2rem" },
                          fontWeight: 700,
                          borderRadius: 2,
                          bgcolor: "secondary.main", // Secondary blue for button
                          "&:hover": { bgcolor: "#1E88E5" }, // Darker blue on hover
                          boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                          transition: "all 0.3s ease",
                          color: "white",
                        }}
                      >
                        Sign In
                      </Button>
                    </Grid>
                    <Grid item xs={12} sx={{ textAlign: "center" }}>
                      <Link
                        href="/register"
                        variant="body2"
                        sx={{
                          color: "primary.main",
                          fontSize: { xs: "0.8rem", sm: "1rem" },
                          textDecoration: "underline",
                          "&:hover": { color: "secondary.main" },
                        }}
                      >
                        New User? Register Now!
                      </Link>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Box>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
