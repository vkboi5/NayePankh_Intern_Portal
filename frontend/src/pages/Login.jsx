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
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loginImage from "../assets/loginBgm.jpg";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const theme = createTheme({
  palette: {
    primary: { main: "#216eb6" },
    secondary: { main: "#42A5F5" },
    background: { default: "#E3F2FD" },
    text: { primary: "#263238", secondary: "#546E7A" },
  },
  typography: { fontFamily: "'Poppins', sans-serif" },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
});

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

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
      console.log(data);
      if (response.ok) {
        const token = data.token;
        localStorage.setItem("token", token);

        // Option 1: If role is in response (preferred)
        let role = data.user.role;

        // Option 2: If role is in token (decode JWT)
        if (!role) {
          const decoded = jwtDecode(token);
          role = decoded.role; // Assumes role is in token payload; adjust if different
        }

        toast.success("Successfully logged in!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          onClose: () => {
            setLoading(false);
            // Redirect based on role
            if (role === "Super Admin") {
              navigate("/superadmin");
            } else if (role === "Admin") {
              navigate("/moderator");
            } else {
              navigate("/dashboard"); // Default for "user" role
            }
          },
        });
      } else {
        toast.error(data.msg || "Login failed", {
          position: "top-right",
          autoClose: 2000,
          onClose: () => setLoading(false),
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.", {
        position: "top-right",
        autoClose: 2000,
        onClose: () => setLoading(false),
      });
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
              maxWidth: { xs: 400, sm: 800 },
              width: "100%",
              boxShadow: "0px 8px 25px rgba(0,0,0,0.15)",
              borderRadius: 3,
              overflow: "hidden",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              mx: "auto",
            }}
          >
            <Box
              sx={{
                flex: { md: 1.2 },
                backgroundImage: {
                  xs: `linear-gradient(rgba(245, 249, 255, 0.2), rgba(245, 249, 255, 0.2)), url(${loginImage})`,
                  sm: `url(${loginImage})`,
                },
                backgroundSize: "cover",
                backgroundPosition: { xs: "center 50%", md: "center" },
                backgroundRepeat: "no-repeat",
                backgroundColor: "#f5f9ff",
                minHeight: { xs: 260, sm: 400 },
                display: "block",
                borderBottom: { xs: "4px solid #216eb6", md: "none" },
                transition: "background-position 0.3s ease",
                backgroundAttachment: { xs: "local", sm: "scroll" },
              }}
            />
            <Box sx={{ flex: { md: 1 }, p: { xs: 2, sm: 4 } }}>
              <Box
                sx={{
                  p: { xs: 2, sm: 3 },
                  textAlign: "center",
                  bgcolor: "primary.main",
                  borderRadius: 10,
                  mb: { xs: 2, sm: 3 },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
                    fontSize: { xs: "1rem", sm: "1.6rem" },
                    fontStyle: "italic",
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
                            "&.Mui-focused fieldset": { borderColor: "primary.main" },
                          },
                          "& .MuiInputLabel-root": { color: "primary.main", fontSize: { xs: "0.9rem", sm: "1rem" } },
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
                          "& .MuiInputLabel-root": { color: "primary.main", fontSize: { xs: "0.9rem", sm: "1rem" } },
                          "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        type="submit"
                        disabled={loading}
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
                          "Sign In"
                        )}
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
      <ToastContainer />
    </ThemeProvider>
  );
};

export default Login;