import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Container,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#216eb6", // Logo-matching blue
    },
    secondary: {
      main: "#42A5F5", // Lighter blue
    },
    background: {
      default: "#E3F2FD", // Very light blue
    },
    lightBlue: {
      main: "#BBDEFB", // Light blue for accents
    },
    text: {
      primary: "#263238", // Darker gray for contrast
      secondary: "#546E7A", // Softer gray for secondary text
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
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

const OngoingCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [timers, setTimers] = useState({});
  const [error, setError] = useState("");
  const [userDetails, setUserDetails] = useState({ referralCode: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [extendConfirmOpen, setExtendConfirmOpen] = useState(false);
  const [extendDurationOpen, setExtendDurationOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState("days");

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view campaigns");
        return;
      }

      try {
        const response = await fetch("https://naye-pankh-intern-portal-ox93.vercel.app/api/auth/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          const { referralCode } = data.user;
          setUserDetails({ referralCode: /^[A-Za-z0-9]+$/.test(referralCode) ? referralCode : "" });
        } else {
          setError(data.msg || "Failed to fetch user details");
        }
      } catch (err) {
        setError("Failed to fetch user details");
        console.error(err);
      }
    };

    const fetchCampaigns = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view campaigns");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("https://naye-pankh-intern-portal-ox93.vercel.app/api/campaign", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          const validCampaigns = data.campaigns || [];
          setCampaigns(validCampaigns.filter(c => c && c._id && c.user && c.user.referralCode));
        } else {
          setError(data.msg || "Failed to load campaigns");
        }
      } catch (err) {
        setError("Failed to fetch campaigns");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
      campaigns.forEach((campaign) => {
        const endDate = new Date(campaign.endDate);
        const now = new Date();
        const timeLeft = endDate - now;

        if (timeLeft > 0) {
          const totalTime = endDate - new Date(campaign.startDate);
          const progress = ((totalTime - timeLeft) / totalTime) * 100;
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          newTimers[campaign._id] = {
            time: `${days}d ${hours}h ${minutes}m ${seconds}s`,
            progress: Math.min(progress, 100),
          };
        } else {
          newTimers[campaign._id] = { time: "Ended", progress: 100 };
        }
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [campaigns]);

  const formatPrettyTimer = (timeStr) => {
    if (timeStr === "Ended") {
      return (
        <Typography variant="body2" color="error.main" sx={{ fontWeight: 600, textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.1)" }}>
          Campaign Ended
        </Typography>
      );
    }
    const parts = timeStr.split(" ");
    return (
      <Typography
        variant="body2"
        color="primary.main"
        sx={{ fontWeight: 500, fontStyle: "italic", textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.1)", display: "inline-flex", gap: 1, alignItems: "center" }}
      >
        {parts.map((part, index) => (
          <span key={index} style={{ marginRight: index < parts.length - 1 ? "4px" : 0 }}>{part}</span>
        ))}
        <CircularProgress
          variant="determinate"
          value={timers[campaigns.find(c => c._id === Object.keys(timers)[0])?.progress] || 0}
          size={20}
          thickness={6}
          sx={{ color: "primary.main", ml: 1 }}
        />
      </Typography>
    );
  };

  const handleExtendConfirm = (campaignId) => {
    setSelectedCampaignId(campaignId);
    setExtendConfirmOpen(true);
  };

  const handleConfirmExtend = () => {
    setExtendConfirmOpen(false);
    setExtendDurationOpen(true);
  };

  const handleCancelExtend = () => {
    setExtendConfirmOpen(false);
    setSelectedCampaignId(null);
  };

  const handleDurationChange = (e) => {
    setDuration(e.target.value);
  };

  const handleUnitChange = (e) => {
    setDurationUnit(e.target.value);
  };

  const handleSubmitExtend = async () => {
    if (!duration || isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      setError("Please enter a valid positive number for extension duration");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to extend a campaign");
      return;
    }

    setIsLoading(true);
    try {
      const milliseconds = durationUnit === "days" ? parseInt(duration) * 24 * 60 * 60 * 1000 : parseInt(duration) * 60 * 60 * 1000;
      const response = await fetch(`https://naye-pankh-intern-portal-ox93.vercel.app/api/campaign/${selectedCampaignId}/extend`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ duration: milliseconds }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Campaign extended successfully:", data.campaign);
        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign._id === selectedCampaignId ? { ...campaign, endDate: data.campaign.endDate } : campaign
          )
        );
        setExtendDurationOpen(false);
        setSelectedCampaignId(null);
        setDuration("");
        setDurationUnit("days");
      } else {
        setError(data.msg || "Failed to extend campaign");
      }
    } catch (err) {
      setError("Error extending campaign");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDuration = () => {
    setExtendDurationOpen(false);
    setSelectedCampaignId(null);
    setDuration("");
    setDurationUnit("days");
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              mb: { xs: 4, md: 6 },
              textAlign: "center",
              color: "primary.main",
              fontWeight: 700,
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Ongoing Campaigns
          </Typography>
          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: { xs: 2, md: 4 } }}>
              <CircularProgress color="primary" />
            </Box>
          )}
          {error && (
            <Typography
              color="error"
              sx={{ mb: { xs: 2, md: 4 }, textAlign: "center", fontSize: { xs: "0.9rem", md: "1.1rem" }, fontWeight: 500 }}
            >
              {error}
            </Typography>
          )}
          {campaigns.length === 0 && !error && (
            <Typography
              sx={{ textAlign: "center", fontSize: { xs: "0.9rem", md: "1.1rem" }, color: "text.secondary", mb: { xs: 4, md: 6 } }}
            >
              No ongoing campaigns found.
            </Typography>
          )}
          {campaigns.length > 0 && (
            <Grid container spacing={{ xs: 2, md: 4 }}>
              {campaigns.map((campaign) => (
                <Grid item xs={12} sm={6} md={4} key={campaign._id}>
                  <Card
                    sx={{
                      boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.15)",
                      borderRadius: 3,
                      bgcolor: "white",
                      border: `2px solid ${theme.palette.primary.main}`,
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": { transform: "translateY(-8px)", boxShadow: "0px 12px 35px rgba(0, 0, 0, 0.25)" },
                      mb: { xs: 4, md: 6 },
                    }}
                  >
                    <CardHeader
                      title={formatPrettyTimer(timers[campaign._id]?.time || "Calculating...")}
                      sx={{
                        bgcolor: theme.palette.lightBlue.main,
                        color: "primary.main",
                        borderRadius: "3px 3px 0 0",
                        p: { xs: 1, md: 2 },
                        textAlign: "center",
                        fontWeight: 600,
                        textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.1)",
                      }}
                    />
                    <LinearProgress
                      variant="determinate"
                      value={timers[campaign._id]?.progress || 0}
                      sx={{
                        height: 8,
                        borderRadius: "0 0 3px 3px",
                        bgcolor: "grey.300",
                        "& .MuiLinearProgress-bar": { bgcolor: theme.palette.primary.main, borderRadius: "0 0 3px 3px" },
                      }}
                    />
                    <CardContent sx={{ p: { xs: 2, md: 4 }, pt: { xs: 1, md: 2 } }}>
                      <Typography
                        variant="h5"
                        sx={{
                          mb: { xs: 2, md: 3 },
                          color: "primary.main",
                          fontWeight: 600,
                          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
                          fontSize: { xs: "1.5rem", md: "2rem" },
                        }}
                      >
                        {campaign.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          mb: { xs: 2, md: 3 },
                          lineHeight: 1.6,
                          fontStyle: "italic",
                          fontSize: { xs: "0.9rem", md: "1rem" },
                        }}
                      >
                        {campaign.description}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ mb: { xs: 1, md: 2 }, fontWeight: 500, fontSize: { xs: "0.9rem", md: "1rem" } }}
                      >
                        Goal: ₹{campaign.goalAmount.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ mb: { xs: 2, md: 3 }, fontWeight: 500, fontSize: { xs: "0.9rem", md: "1rem" } }}
                      >
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
                          mb: { xs: 2, md: 3 },
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          mb: { xs: 2, md: 3 },
                          textAlign: "center",
                          color: "text.secondary",
                          fontWeight: 500,
                          textShadow: "0.5px 0.5px 1px rgba(0, 0, 0, 0.05)",
                          fontSize: { xs: "0.8rem", md: "0.9rem" },
                        }}
                      >
                        {Math.round((campaign.raisedAmount / campaign.goalAmount) * 100) || 0}% of goal reached
                      </Typography>
                      <Box sx={{ display: "flex", gap: { xs: 1, md: 2 }, mb: { xs: 2, md: 4 } }}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="secondary"
                          onClick={() => handleExtendConfirm(campaign._id)}
                          sx={{
                            py: { xs: 1, md: 1.5 },
                            fontSize: { xs: "0.9rem", md: "1rem" },
                            fontWeight: "bold",
                            borderRadius: 2,
                            bgcolor: "secondary.main",
                            "&:hover": { bgcolor: "secondary.dark", transform: "scale(1.03)" },
                            transition: "all 0.3s ease",
                            boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                          }}
                        >
                          Extend Now
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Dialog open={extendConfirmOpen} onClose={handleCancelExtend} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ bgcolor: "primary.main", color: "white", textAlign: "center", p: 1, mb: 2 }}>
              Confirm Extension
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ color: "text.primary", textAlign: "center" }}>
                Are you sure you want to extend this campaign?
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center", p: 2 }}>
              <Button
                onClick={handleCancelExtend}
                variant="outlined"
                color="primary"
                sx={{
                  borderRadius: 2,
                  py: 1,
                  fontWeight: "bold",
                  "&:hover": { bgcolor: "rgba(33,110,182,0.1)" },
                  mr: 2,
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmExtend}
                variant="contained"
                color="primary"
                sx={{
                  bgcolor: "primary.main",
                  borderRadius: 2,
                  py: 1,
                  fontWeight: "bold",
                  "&:hover": { bgcolor: "#1E5FA4", transform: "scale(1.03)" },
                  transition: "all 0.3s ease",
                }}
              >
                Yes, Extend
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={extendDurationOpen} onClose={handleCancelDuration} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ bgcolor: "primary.main", color: "white", textAlign: "center", p: 1, mb: 4 }}>
              Extend Campaign Duration
            </DialogTitle>
            <DialogContent sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="Duration"
                    type="number"
                    value={duration}
                    onChange={handleDurationChange}
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": { borderColor: "primary.main" },
                        "&.Mui-focused fieldset": { borderColor: "primary.main" },
                      },
                      "& .MuiInputLabel-root": { color: "primary.main" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                    }}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth variant="outlined">
                    <Select
                      id="duration-unit"
                      value={durationUnit}
                      onChange={handleUnitChange}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": { borderColor: "primary.main" },
                          "&.Mui-focused fieldset": { borderColor: "primary.main" },
                        },
                        "& .MuiSelect-icon": { color: "primary.main" },
                      }}
                    >
                      <MenuItem value="days">Days</MenuItem>
                      <MenuItem value="hours">Hours</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {error && (
                <Typography sx={{ mt: 2, color: "error.main", textAlign: "center" }}>{error}</Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center", p: 2 }}>
              <Button
                onClick={handleCancelDuration}
                variant="outlined"
                color="primary"
                sx={{
                  borderRadius: 2,
                  py: 1,
                  fontWeight: "bold",
                  "&:hover": { bgcolor: "rgba(33,110,182,0.1)" },
                  mr: 2,
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitExtend}
                variant="contained"
                color="primary"
                sx={{
                  bgcolor: "primary.main",
                  borderRadius: 2,
                  py: 1,
                  fontWeight: "bold",
                  "&:hover": { bgcolor: "#1E5FA4", transform: "scale(1.03)" },
                  transition: "all 0.3s ease",
                }}
              >
                Extend
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default OngoingCampaigns;