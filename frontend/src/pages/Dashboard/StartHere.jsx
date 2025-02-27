import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Container,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Custom theme to match your app's aesthetic
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

const CreateCampaign = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goalAmount: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to create a campaign");
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on input change
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to create a campaign");
      return;
    }

    // Validation
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (!formData.title || !formData.description || !formData.goalAmount || !formData.startDate || !formData.endDate) {
      setError("All fields are required");
      return;
    }
    if (isNaN(start) || isNaN(end) || start >= end) {
      setError("End date must be after start date");
      return;
    }
    if (parseFloat(formData.goalAmount) <= 0) {
      setError("Goal amount must be greater than 0");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          goalAmount: parseFloat(formData.goalAmount),
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Campaign created:", data.campaign);
        setFormData({ title: "", description: "", goalAmount: "", startDate: "", endDate: "" });
        setError("");
        setSuccess(true);
      } else {
        setError(data.msg || "Failed to create campaign");
        console.error(data.msg);
      }
    } catch (error) {
      setError("Error creating campaign");
      console.error("Error creating campaign:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
        <Container maxWidth="sm">
          <Typography
            variant="h4"
            sx={{
              mb: { xs: 2, sm: 4 },
              textAlign: "center",
              color: "primary.main",
              fontWeight: 700,
              fontSize: { xs: "1.5rem", sm: "2.5rem" },
            }}
          >
            Create a New Campaign
          </Typography>
          <Card sx={{ boxShadow: "0px 4px 15px rgba(0,0,0,0.1)", borderRadius: 3, p: { xs: 1, sm: 2 } }}>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Box component="form" onSubmit={handleCreateCampaign}>
                <Grid container spacing={{ xs: 1, sm: 3 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Campaign Title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
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
                      label="Description"
                      name="description"
                      multiline
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
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
                      label="Goal Amount (INR)"
                      name="goalAmount"
                      type="number"
                      value={formData.goalAmount}
                      onChange={handleInputChange}
                      required
                      inputProps={{ min: 1 }}
                      variant="outlined"
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
                      label="Start Date"
                      name="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
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
                      label="End Date"
                      name="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
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
                  {error && (
                    <Grid item xs={12}>
                      <Typography
                        color="error"
                        sx={{
                          textAlign: "center",
                          fontSize: { xs: "0.8rem", sm: "1rem" },
                        }}
                      >
                        {error}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={isLoading}
                      sx={{
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: "0.9rem", sm: "1.1rem" },
                        fontWeight: "bold",
                        borderRadius: 2,
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      {isLoading ? "Creating..." : "Create Campaign"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Container>
        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{
              width: "100%",
              fontSize: { xs: "0.8rem", sm: "1rem" },
            }}
          >
            Campaign created successfully!
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default CreateCampaign;