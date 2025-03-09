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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import registerImage from "../assets/registerBgm.jpg"; // Replace with your image path

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

const Register = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    internshipPeriod: "",
  });
  const [loading, setLoading] = useState(false); // Loader state

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader at the start
    try {
      const response = await fetch("https://naye-pankh-intern-portal.vercel.app/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        toast.success("Successfully registered!", {
          position: "top-right",
          autoClose: 2000, // Toast visible for 2 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          onClose: () => {
            setLoading(false); // Stop loader only after toast closes
            window.location.href = "/dashboard"; // Redirect after toast
          }, // Redirect when toast closes
        });
      } else {
        console.error(data.msg);
        toast.error(data.msg || "Registration failed", {
          position: "top-right",
          autoClose: 2000,
          onClose: () => setLoading(false), // Stop loader after error toast
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred. Please try again.", {
        position: "top-right",
        autoClose: 2000,
        onClose: () => setLoading(false), // Stop loader after error toast
      });
    }
    // Note: Removed the `finally` block to control loader via toast `onClose`
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
              maxWidth: { xs: 400, sm: 800 },
              width: "100%",
              boxShadow: "0px 8px 25px rgba(0,0,0,0.15)",
              borderRadius: 3,
              overflow: "hidden",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Image Section */}
            <Box
              sx={{
                flex: { xs: 1, md: 1.2 },
                position: "relative",
                display: "block",
                overflow: "hidden",
                borderRight: { xs: "none", md: "1px solid #e0e0e0" },
                minHeight: { xs: 300, sm: 500 },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `url(${registerImage})`,
                  backgroundSize: { xs: "cover", sm: "cover" },
                  backgroundPosition: "center 80%",
                  backgroundRepeat: "no-repeat",
                  transition: "transform 0.3s ease-in-out",
                },
                bgcolor: "#216eb6",
                "&:hover::before": {
                  transform: "scale(1.05)",
                },
              }}
            />
            {/* Form Section */}
            <Box
              sx={{
                flex: { md: 1 },
                p: { xs: 2, sm: 4 },
              }}
            >
              <Box
                sx={{
                  p: { xs: 2, sm: 3 },
                  textAlign: "center",
                  bgcolor: "primary.main",
                  borderRadius: 10,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
                    fontSize: { xs: "1rem", sm: "1.4rem" },
                    fontStyle: "italic",
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
                      <FormControl fullWidth required>
                        <InputLabel
                          sx={{
                            color: "primary.main",
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                            "&.Mui-focused": { color: "primary.main" },
                          }}
                        >
                          Internship Period
                        </InputLabel>
                        <Select
                          name="internshipPeriod"
                          value={formData.internshipPeriod}
                          onChange={handleInputChange}
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "grey.500",
                              "&:hover": { borderColor: "primary.main" },
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "primary.main",
                            },
                          }}
                        >
                          <MenuItem value="1 week">1 Week</MenuItem>
                          <MenuItem value="2 weeks">2 Weeks</MenuItem>
                          <MenuItem value="1 month">1 Month</MenuItem>
                          <MenuItem value="3 months">3 Months</MenuItem>
                          <MenuItem value="6 months">6 Months</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        type="submit"
                        disabled={loading} // Disable button while loading
                        sx={{
                          py: { xs: 1, sm: 1.5 },
                          fontSize: { xs: "1rem", sm: "1.2rem" },
                          fontWeight: 700,
                          borderRadius: 2,
                          bgcolor: "secondary.main",
                          "&:hover": { bgcolor: "#1E88E5" },
                          boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                          transition: "all 0.3s ease",
                          color: "white",
                          position: "relative",
                        }}
                      >
                        {loading ? (
                          <CircularProgress
                            size={24}
                            sx={{
                              color: "white",
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              marginTop: "-12px",
                              marginLeft: "-12px",
                            }}
                          />
                        ) : (
                          "Sign Up"
                        )}
                      </Button>
                    </Grid>
                    <Grid item xs={12} sx={{ textAlign: "center" }}>
                      <Link
                        href="/login"
                        variant="body2"
                        sx={{
                          color: "primary.main",
                          fontSize: { xs: "0.8rem", sm: "1rem" },
                          textDecoration: "underline",
                          "&:hover": { color: "secondary.main" },
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
      <ToastContainer />
    </ThemeProvider>
  );
};

export default Register;