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
import registerImage from "../assets/image1.png"; // Replace with your image path

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

const Register = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://naye-pankh-intern-portal-backend.vercel.app/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";
      } else {
        console.error(data.msg);
      }
    } catch (error) {
      console.error("Registration error:", error);
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
              overflow: "hidden", // Ensure image doesn’t overflow
              display: "flex",
              flexDirection: { xs: "column", md: "row" }, // Stack on mobile, side-by-side on desktop
            }}
          >
            {/* Image Section (integrated within the card, slightly wider) */}
            <Box
              sx={{
                flex: { md: 1.2 }, // Slightly wider (1.2 instead of 1) on desktop
                backgroundImage: `url(${registerImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: { xs: 150, sm: 400 }, // Taller on desktop, smaller on mobile
                display: { xs: "none", md: "block" }, // Hide on mobile, show on desktop
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
                  bgcolor: "primary.main", // Saffron header for modern look
                  borderRadius:10,
                }}
              >
                <Typography
                  variant="body1" // Smaller text for "Sign Up"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.2)", // Subtle shadow for depth
                    fontSize: { xs: "1rem", sm: "1.4rem" },
                    fontStyle: "italic", // Stylish touch
                  }}
                >
                  Sign Up
                </Typography>
              </Box>
              <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                <Box component="form" onSubmit={handleRegister}>
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstname"
                        variant="outlined"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": { borderColor: "primary.main" },
                            "&.Mui-focused fieldset": { borderColor: "primary.main" },
                          },
                          "& .MuiInputLabel-root": {
                            color: "primary.main",
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          },
                          "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastname"
                        variant="outlined"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": { borderColor: "primary.main" },
                            "&.Mui-focused fieldset": { borderColor: "primary.main" },
                          },
                          "& .MuiInputLabel-root": {
                            color: "primary.main",
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          },
                          "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                        }}
                      />
                    </Grid>
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
                            "&.Mui-focused fieldset": { borderColor: "primary.main" },
                          },
                          "& .MuiInputLabel-root": {
                            color: "primary.main",
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          },
                          "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
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
                            "&.Mui-focused fieldset": { borderColor: "primary.main" },
                          },
                          "& .MuiInputLabel-root": {
                            color: "primary.main",
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          },
                          "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        type="submit"
                        sx={{
                          py: { xs: 1, sm: 1.5 },
                          fontSize: { xs: "1rem", sm: "1.2rem" },
                          fontWeight: 700,
                          borderRadius: 2,
                          bgcolor: "secondary.main", // Green for a unique touch
                          "&:hover": { bgcolor: "secondary.dark" },
                          boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                          transition: "all 0.3s ease",
                          color:"white",
                        }}
                      >
                        Sign Up
                      </Button>
                    </Grid>
                    <Grid item xs={12} sx={{ textAlign: "center" }}>
                      <Link
                        href="/login"
                        variant="body2"
                        sx={{
                          color: "primary.main",
                          fontSize: { xs: "0.8rem", sm: "1rem" },
                        }}
                      >
                        Already have an account? Login
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

export default Register;