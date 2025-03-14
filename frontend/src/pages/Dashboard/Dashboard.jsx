import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Card,
  CardContent,
  Button,
  Snackbar,
  Avatar,
  Popover,
  ListItemButton as PopoverListItemButton,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ListAlt as ListAltIcon,
  ProductionQuantityLimits,
  WhatsApp as WhatsAppIcon,
  Star as StarIcon,
  ContentCopy as ContentCopyIcon,
  Message,
  QuestionMark,
  BookOnline,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Transactions from "./Transactions";
import CampaignStatus from "./CampaignStatus";
import bgImg from "../../assets/welcome-img.webp";
import Feedback from "./Feedback";
import LearningModules from "./LearningModules";
import FAQ from "./FAQ";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import Footer from "./Footer";
import { jwtDecode } from "jwt-decode";
import styled from "@emotion/styled";

const drawerWidth = 260;

const theme = createTheme({
  palette: {
    primary: { main: "#216eb6" },
    secondary: { main: "#42A5F5" },
    background: { default: "#E3F2FD" },
    lightBlue: { main: "#BBDEFB" },
    whatsappGreen: { main: "#25D366" },
    referralPink: { main: "#ffa800" },
    text: { primary: "#263238", secondary: "#546E7A" },
  },
  typography: { fontFamily: "'Poppins', sans-serif" },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
});

const FRONTEND_URL = "https://nayepankh-tan.vercel.app";

// Custom Animated Linear Progress Bar
const AnimatedLinearProgress = styled(LinearProgress)(({ theme, value }) => ({
  height: 20,
  borderRadius: 10,
  backgroundColor: "#e0e0e0",
  boxShadow: "inset 0px 2px 4px rgba(0,0,0,0.1)",
  "& .MuiLinearProgress-bar": {
    background: "linear-gradient(90deg, #42A5F5, #216eb6)",
    borderRadius: 10,
    animation: "progressAnimation 1.5s ease-out forwards",
    boxShadow: "0px 2px 8px rgba(33,110,182,0.5)",
  },
  "@keyframes progressAnimation": {
    "0%": { width: 0 },
    "100%": { width: `${value}%` },
  },
}));

const DashboardPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSection, setSelectedSection] = useState("Dashboard");
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [userGoalData, setUserGoalData] = useState({
    totalRaised: 0,
    totalGoal: 20000, // Intern goal set to ₹20,000
  });
  const [userDetails, setUserDetails] = useState({
    name: "User",
    email: "",
    referralCode: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [rewardsDialogOpen, setRewardsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [chartWidth, setChartWidth] = useState(
    Math.min(window.innerWidth - 40, 600)
  );
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    const handleResize = () => {
      setChartWidth(Math.min(window.innerWidth - 40, 800));
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role === "Super Admin") {
        navigate("/superadmin");
        return;
      } else if (decoded.role === "Admin") {
        navigate("/moderator");
        return;
      } else if (decoded.role !== "Intern") {
        navigate("/login");
        return;
      }
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "https://naye-pankh-intern-portal-ox93.vercel.app/api/auth/user",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          const { firstname, lastname, email, referralCode } = data.user;
          setUserDetails({
            name: `${firstname} ${lastname}`.trim() || "Unnamed Intern",
            email: email || "Not provided",
            referralCode: /^[A-Za-z0-9]+$/.test(referralCode)
              ? referralCode
              : "N/A",
          });
        } else {
          setError(data.msg || "Failed to fetch user details");
          console.error("API Error:", data.msg);
        }
      } catch (error) {
        setError("Error fetching user details. Please try again.");
        console.error("Fetch Error:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCampaignData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "https://naye-pankh-intern-portal-ox93.vercel.app/api/campaign",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setCampaigns(data.campaigns || []);
          setSelectedCampaign(
            data.campaigns.length > 0 ? data.campaigns[0] : null
          );
        } else {
          console.error("Failed to fetch campaigns:", data.msg);
        }
      } catch (error) {
        console.error("Error fetching campaign data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchLeaderboardData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "https://naye-pankh-intern-portal-ox93.vercel.app/api/donations/leaderboard",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          const leaderboard = data.leaderboard.map((entry) => ({
            name: entry.name || "Anonymous",
            donations: entry.totalAmount,
          }));
          setLeaderboardData(leaderboard);
        } else {
          console.error("Failed to fetch leaderboard data:", data.msg);
          setError(data.msg || "Failed to fetch leaderboard data");
        }
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        setError("Error fetching leaderboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserGoalData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "https://naye-pankh-intern-portal-ox93.vercel.app/api/donations",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          const userDonations = data.donations || [];
          const totalRaised = userDonations.reduce(
            (sum, donation) => sum + donation.amount,
            0
          );
          setUserGoalData((prev) => ({ ...prev, totalRaised }));
        } else {
          setError(data.msg || "Failed to fetch user donation data");
        }
      } catch (error) {
        setError("Error fetching user donation data. Please try again.");
        console.error("Fetch Error:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserGoalData();
    fetchUserDetails();
    fetchCampaignData();
    fetchLeaderboardData();
  }, [isLoggedIn, token, navigate]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogin = () => navigate("/login");
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setAnchorEl(null);
  };
  const handleSectionChange = (section) => {
    setSelectedSection(section);
    if (mobileOpen) setMobileOpen(false);
  };
  const handleLogoClick = () => navigate("/");
  const handleCopyLink = () => {
    if (!/^[A-Za-z0-9]+$/.test(userDetails.referralCode)) {
      setError("Invalid referral code");
      return;
    }
    const donationLink = `${FRONTEND_URL}/donate?ref=${encodeURIComponent(
      userDetails.referralCode
    )}`;
    navigator.clipboard.writeText(donationLink);
    setSnackbarOpen(true);
  };
  const handleShareWhatsApp = (campaign) => {
    if (!/^[A-Za-z0-9]+$/.test(userDetails.referralCode)) {
      console.error("Invalid referral code:", userDetails.referralCode);
      return;
    }
    const donationLink = `${FRONTEND_URL}/donate?ref=${encodeURIComponent(
      userDetails.referralCode
    )}`;
    const message = `Support "${
      campaign?.title || "Our Campaigns"
    }" with NayePankh Foundation! ${
      campaign?.description || "Help make a difference."
    } Goal: ₹${campaign?.goalAmount?.toLocaleString() || "N/A"}, Raised: ₹${
      campaign?.raisedAmount?.toLocaleString() || "0"
    }. Donate here: ${donationLink} using referral code ${
      userDetails.referralCode
    }. Visit www.nayepankh.org.in for more.`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };
  const handleShareWhatsAppHero = () => {
    if (!/^[A-Za-z0-9]+$/.test(userDetails.referralCode)) {
      console.error("Invalid referral code:", userDetails.referralCode);
      return;
    }
    const donationLink = `${FRONTEND_URL}/donate?ref=${encodeURIComponent(
      userDetails.referralCode
    )}`;
    const message = `Support "Our Campaigns" with NayePankh Foundation! Help make a difference. Goal: ₹${userGoalData.totalGoal.toLocaleString()}, Raised: ₹${userGoalData.totalRaised.toLocaleString()}. Donate here: ${donationLink} using referral code ${
      userDetails.referralCode
    }. Visit www.nayepankh.org.in for more.`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };
  const handleRewardsClick = () => setRewardsDialogOpen(true);
  const handleCloseDialog = () => setRewardsDialogOpen(false);
  const handleCloseSnackbar = () => setSnackbarOpen(false);
  const handleStartHere = () => handleSectionChange("Learning Modules");

  const getLevelAchieved = (raisedAmount) => {
    if (raisedAmount >= 10000) return "Master";
    if (raisedAmount >= 5000) return "Ninja";
    if (raisedAmount >= 1000) return "Star";
    return "Beginner";
  };

  const getLinearProgress = (raised, goal) => {
    const progress = Math.min((raised / goal) * 100, 100) || 0;
    return (
      <Box sx={{ width: "100%", mb: 2 }}>
        <AnimatedLinearProgress variant="determinate" value={progress} />
        <Typography
          variant="body2"
          color="primary.main"
          sx={{
            textAlign: "center",
            mt: 1,
            fontWeight: 600,
            fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
          }}
        >
          {`${Math.round(progress)}% Achieved`}
        </Typography>
      </Box>
    );
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon /> },
    { text: "Transactions", icon: <ListAltIcon /> },
    { text: "Ongoing Campaigns", icon: <ProductionQuantityLimits /> },
    { text: "Learning Modules", icon: <BookOnline /> },
    { text: "Feedback", icon: <Message /> },
    { text: "FAQ", icon: <QuestionMark /> },
  ];

  const drawerContent = (
    <Box
      sx={{
        bgcolor: "#F9F9F9",
        height: "100%",
        borderRight: "1px solid #E0E0E0",
      }}
    >
      <Box
        sx={{
          p: { xs: 1, sm: 2 },
          bgcolor: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0px 2px 10px rgba(0,0,0,0.2)",
        }}
        onClick={handleLogoClick}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "white",
            letterSpacing: 1,
            fontStyle: "normal",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            fontSize: { xs: "1.2rem", sm: "1.8rem" },
          }}
        >
          NayePankh
        </Typography>
      </Box>
      <List sx={{ py: { xs: 1, sm: 2 } }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <PopoverListItemButton
              onClick={() => handleSectionChange(item.text)}
              sx={{
                py: { xs: 1, sm: 1.5 },
                px: { xs: 1.5, sm: 3 },
                bgcolor:
                  selectedSection === item.text
                    ? "rgba(33,110,182,0.1)"
                    : "transparent",
                color:
                  selectedSection === item.text
                    ? "primary.main"
                    : "text.secondary",
                "&:hover": {
                  bgcolor: "rgba(33,110,182,0.1)",
                  color: "primary.main",
                },
                transition: "all 0.3s ease",
                borderRadius: 1,
                mx: { xs: 0.5, sm: 1 },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    selectedSection === item.text
                      ? "primary.main"
                      : "text.secondary",
                  minWidth: { xs: 30, sm: 48 },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: { xs: "0.8rem", sm: "1rem" },
                    fontWeight: selectedSection === item.text ? 600 : 400,
                  },
                }}
              />
            </PopoverListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            bgcolor: "primary.main",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.15)",
            borderBottom: "none",
          }}
        >
          <Toolbar sx={{ py: { xs: 0.5, sm: 1 } }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: { xs: 0.5, sm: 2 },
                display: { sm: "none" },
                color: "white",
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              sx={{
                flexGrow: 1,
                color: "white",
                fontWeight: 700,
                fontSize: { xs: "1rem", sm: "1.5rem" },
                letterSpacing: 0.5,
              }}
            >
              Welcome, {userDetails.name}!
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 1 },
              }}
            >
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                sx={{ p: { xs: 0.3, sm: 1 } }}
              >
                <Avatar
                  alt={userDetails.name}
                  src="/path-to-avatar.jpg"
                  sx={{
                    width: { xs: 24, sm: 40 },
                    height: { xs: 24, sm: 40 },
                    border: "2px solid white",
                    boxShadow: "0px 0px 12px rgba(255, 255, 255, 0.5)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0px 0px 16px rgba(255, 255, 255, 0.8)",
                    },
                  }}
                />
              </IconButton>
              {isLoggedIn ? (
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  sx={{
                    ml: { xs: 0.5, sm: 2 },
                    color: "white",
                    borderColor: "white",
                    fontWeight: "bold",
                    borderRadius: 20,
                    fontSize: { xs: "0.7rem", sm: "1rem" },
                    py: { xs: 0.3, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.1)",
                      borderColor: "white",
                    },
                  }}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleLogin}
                  sx={{
                    ml: { xs: 0.5, sm: 2 },
                    bgcolor: "white",
                    color: "primary.main",
                    fontWeight: "bold",
                    borderRadius: 20,
                    fontSize: { xs: "0.7rem", sm: "1rem" },
                    py: { xs: 0.3, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    "&:hover": { bgcolor: "#F0F7FF" },
                  }}
                >
                  Login
                </Button>
              )}
              <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{
                  "& .MuiPopover-paper": {
                    borderRadius: 2,
                    boxShadow: "0px 6px 25px rgba(0,0,0,0.15)",
                    bgcolor: "white",
                    minWidth: { xs: 150, sm: 220 },
                    border: "1px solid rgba(33,110,182,0.2)",
                  },
                }}
              >
                <Box sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      mb: 1,
                      fontSize: { xs: "0.9rem", sm: "1.1rem" },
                    }}
                  >
                    {userDetails.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      mb: 2,
                      fontSize: { xs: "0.7rem", sm: "0.9rem" },
                    }}
                  >
                    {userDetails.email}
                  </Typography>
                  <PopoverListItemButton
                    onClick={handleLogout}
                    sx={{
                      py: 1,
                      px: 2,
                      fontSize: { xs: "0.8rem", sm: "1rem" },
                      color: "primary.main",
                      "&:hover": { bgcolor: "rgba(33,110,182,0.1)" },
                      borderRadius: 1,
                    }}
                  >
                    Logout
                  </PopoverListItemButton>
                </Box>
              </Popover>
            </Box>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {drawerContent}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1, sm: 2, md: 4 },
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            overflow: "auto",
            mt: { xs: 7, sm: 9, md: 10 },
            bgcolor: "background.default",
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <LinearProgress color="primary" sx={{ width: "50%" }} />
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mb: { xs: 2, sm: 4 } }}>
            <Breadcrumbs
              separator={
                <NavigateNextIcon
                  fontSize="small"
                  sx={{ color: "text.secondary" }}
                />
              }
              aria-label="breadcrumb"
              sx={{
                bgcolor: "white",
                p: { xs: 1, sm: 1.5, md: 2 },
                fontSize: { xs: "0.7rem", sm: "0.85rem", md: "1rem" },
                borderRadius: 2,
                boxShadow: "0px 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <Link
                underline="hover"
                color="text.secondary"
                sx={{
                  fontSize: { xs: "0.7rem", sm: "0.9rem", md: "1rem" },
                  cursor: "pointer",
                }}
                onClick={() => handleSectionChange("Dashboard")}
              >
                / Dashboard
              </Link>
              <Typography
                color="primary.main"
                sx={{
                  fontSize: { xs: "0.7rem", sm: "0.9rem", md: "1rem" },
                  fontWeight: 600,
                }}
              >
                {selectedSection}
              </Typography>
            </Breadcrumbs>
          </Box>
          {selectedSection === "Dashboard" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 2, sm: 4 },
              }}
            >
              {/* Welcome Card */}
              <Card
                sx={{
                  minHeight: { xs: 220, sm: 320, md: 420 },
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgImg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: 3,
                  boxShadow: "0px 6px 20px rgba(0,0,0,0.2)",
                  overflow: "hidden",
                  transition: "all 0.4s ease",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: "0px 8px 25px rgba(0,0,0,0.3)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 2, sm: 3, md: 5 },
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      color: "white",
                      mb: { xs: 1, sm: 2 },
                      textShadow: "4px 4px 12px rgba(0,0,0,0.6)",
                      fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3.5rem" },
                      letterSpacing: 1.2,
                    }}
                  >
                    Hello, {userDetails.name}!
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "rgba(255,255,255,0.95)",
                      maxWidth: { xs: 220, sm: 450, md: 650 },
                      fontWeight: 400,
                      fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
                      mb: { xs: 1, sm: 2, md: 3 },
                      textShadow: "2px 2px 5px rgba(0,0,0,0.4)",
                    }}
                  >
                    "Every journey begins with a single step—let's make a
                    difference together!"
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.3rem" },
                      mb: { xs: 0.5, sm: 1 },
                      textShadow: "1px 1px 5px rgba(0,0,0,0.4)",
                    }}
                  >
                    Email: {userDetails.email}
                  </Typography>

                  {/* Referral Code Section */}
                  <Typography
                    variant="body1"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
                      mb: { xs: 0.5, sm: 1, md: 2 },
                      textAlign: "center",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    Your Referral Code:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "goldenrod",
                      fontWeight: 800,
                      fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
                      mb: { xs: 0.5, sm: 1, md: 2 },
                      textAlign: "center",
                      display: "inline-block",
                      border: `2px solid ${theme.palette.referralPink.main}`,
                      borderRadius: "12px",
                      padding: {
                        xs: "6px 12px",
                        sm: "8px 16px",
                        md: "10px 20px",
                      },
                      background: "rgba(211,47,47,0.1)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "rgba(211,47,47,0.2)",
                        boxShadow: "0px 0px 15px rgba(211,47,47,0.5)",
                      },
                    }}
                  >
                    {userDetails.referralCode}
                  </Typography>

                  {/* Buttons Section */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: { xs: 1, sm: 2 },
                      flexWrap: "wrap",
                      justifyContent: "center",
                      mt: { xs: 2, sm: 3, md: 4 },
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyLink}
                      sx={{
                        bgcolor: "secondary.main",
                        color: "white",
                        "&:hover": {
                          bgcolor: "#1E88E5",
                          boxShadow: "0px 4px 15px rgba(0,0,0,0.3)",
                        },
                        borderRadius: 30,
                        py: { xs: 0.8, sm: 1.2, md: 1.5 },
                        px: { xs: 2, sm: 3, md: 4 },
                        width: { xs: "100%", sm: "auto" },
                        fontWeight: "bold",
                        fontSize: { xs: "0.8rem", sm: "1rem", md: "1.2rem" },
                        transition: "all 0.3s ease",
                        textTransform: "none",
                      }}
                    >
                      Copy Link
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<WhatsAppIcon />}
                      onClick={handleShareWhatsAppHero}
                      sx={{
                        bgcolor: "whatsappGreen.main",
                        color: "white",
                        "&:hover": {
                          bgcolor: "#20B858",
                          boxShadow: "0px 4px 15px rgba(0,0,0,0.3)",
                        },
                        borderRadius: 30,
                        py: { xs: 0.8, sm: 1.2, md: 1.5 },
                        px: { xs: 2, sm: 3, md: 4 },
                        width: { xs: "100%", sm: "auto" },
                        fontWeight: "bold",
                        fontSize: { xs: "0.8rem", sm: "1rem", md: "1.2rem" },
                        transition: "all 0.3s ease",
                        textTransform: "none",
                      }}
                    >
                      Share
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Goal Achieved Card */}
              <Card
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  boxShadow: "0px 4px 20px rgba(0,0,0,0.12)",
                  bgcolor: "white",
                  background: "linear-gradient(135deg, #ffffff, #e3f2fd)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0px 10px 30px rgba(0,0,0,0.18)",
                  },
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{
                      color: "primary.main",
                      fontWeight: 700,
                      mb: 2,
                      fontSize: { xs: "1.2rem", sm: "1.5rem" },
                      textAlign: "center",
                    }}
                  >
                    Your Total Goal Achieved
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Box sx={{ textAlign: "center", width: "100%" }}>
                      {getLinearProgress(
                        userGoalData.totalRaised,
                        userGoalData.totalGoal
                      )}
                      <Typography
                        variant="h6"
                        sx={{ color: "primary.main", fontWeight: 700, mt: 2 }}
                      >
                        Raised: ₹{userGoalData.totalRaised.toLocaleString()} / ₹
                        {userGoalData.totalGoal.toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ color: "primary.main", fontWeight: 700 }}
                    >
                      Level Achieved:{" "}
                      {getLevelAchieved(userGoalData.totalRaised)}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 1.5,
                        width: "100%",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleRewardsClick}
                        sx={{
                          minWidth: 110,
                          fontSize: "0.8rem",
                          borderRadius: 30,
                        }}
                      >
                        Rewards
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleCopyLink}
                        sx={{
                          minWidth: 140,
                          fontSize: "0.8rem",
                          borderRadius: 30,
                        }}
                      >
                        Copy Link
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleStartHere}
                        sx={{
                          minWidth: 120,
                          fontSize: "0.8rem",
                          borderRadius: 30,
                        }}
                      >
                        Start Here
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<WhatsAppIcon />}
                        onClick={handleShareWhatsAppHero}
                        sx={{
                          bgcolor: "#25D366",
                          color: "white",
                          minWidth: 160,
                          fontSize: "0.8rem",
                          borderRadius: 30,
                        }}
                      >
                        Share on WhatsApp
                      </Button>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", fontSize: "0.9rem" }}
                    >
                      Unlock Ninja Level at ₹5000 | Time Left: 11 Days
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "primary.main", fontWeight: 600 }}
                    >
                      Reference Code: {userDetails.referralCode}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Leadership Board Card */}
              <Card
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 2,
                  boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
                  bgcolor: "white",
                  background: "linear-gradient(135deg, #ffffff, #f0f7ff)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0px 8px 25px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: { xs: 2, sm: 3 },
                      color: "primary.main",
                      fontWeight: 700,
                      fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
                      textAlign: "center",
                      background: "linear-gradient(90deg, #216eb6, #42A5F5)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Leadership Board
                  </Typography>
                  {leaderboardData.length > 0 ? (
                    <BarChart
                      width={chartWidth}
                      height={300}
                      data={leaderboardData}
                      margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: "#546E7A" }}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        label={{
                          value: "Total Amount (₹)",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#216eb6",
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                        tick={{ fontSize: 12, fill: "#546E7A" }}
                      />
                      <Tooltip
                        formatter={(value) => `₹${value.toLocaleString()}`}
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: 5,
                          border: "1px solid #e0e0e0",
                          fontSize: 12,
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          fontSize: 14,
                          color: "#263238",
                          paddingTop: 10,
                        }}
                      />
                      <Bar
                        dataKey="donations"
                        fill={theme.palette.primary.main}
                        name="Total Donations"
                        barSize={30}
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        textAlign: "center",
                        fontStyle: "italic",
                        fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                        py: 2,
                      }}
                    >
                      No leaderboard data available yet. Start fundraising to
                      climb the ranks!
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Ongoing Campaigns Card */}
              {campaigns.length > 0 && (
                <Card
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
                    bgcolor: "white",
                    background: "linear-gradient(135deg, #ffffff, #f0f7ff)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0px 8px 25px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: { xs: 2, sm: 3 },
                        color: "primary.main",
                        fontWeight: 700,
                        fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
                        textAlign: "center",
                        background: "linear-gradient(90deg, #216eb6, #42A5F5)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Ongoing Campaigns!
                    </Typography>
                    <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                      {campaigns.map((campaign) => (
                        <Grid item xs={12} sm={6} md={4} key={campaign._id}>
                          <Card
                            sx={{
                              boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
                              borderRadius: 2,
                              bgcolor: "white",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "scale(1.05)",
                                boxShadow: "0px 4px 15px rgba(0,0,0,0.15)",
                              },
                            }}
                          >
                            <CardContent
                              sx={{
                                p: { xs: 1, sm: 2, md: 3 },
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  mb: { xs: 1, sm: 1.5 },
                                  color: "primary.main",
                                  fontWeight: 600,
                                  fontSize: {
                                    xs: "1rem",
                                    sm: "1.1rem",
                                    md: "1.3rem",
                                  },
                                  textAlign: "center",
                                }}
                              >
                                {campaign.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  mb: { xs: 1, sm: 2 },
                                  color: "text.secondary",
                                  fontSize: {
                                    xs: "0.7rem",
                                    sm: "0.8rem",
                                    md: "0.9rem",
                                  },
                                  lineHeight: 1.5,
                                  textAlign: "center",
                                }}
                              >
                                {campaign.description}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  mb: { xs: 0.5, sm: 1 },
                                  fontWeight: 500,
                                  fontSize: {
                                    xs: "0.8rem",
                                    sm: "0.9rem",
                                    md: "1rem",
                                  },
                                }}
                              >
                                Goal: ₹{campaign.goalAmount.toLocaleString()}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  mb: { xs: 0.5, sm: 1 },
                                  fontWeight: 500,
                                  fontSize: {
                                    xs: "0.8rem",
                                    sm: "0.9rem",
                                    md: "1rem",
                                  },
                                }}
                              >
                                Raised: ₹
                                {campaign.raisedAmount.toLocaleString()}
                              </Typography>
                              {getLinearProgress(
                                campaign.raisedAmount,
                                campaign.goalAmount
                              )}
                              <Box sx={{ mt: { xs: 1, sm: 2 } }}>
                                <Button
                                  variant="contained"
                                  startIcon={<WhatsAppIcon />}
                                  onClick={() => handleShareWhatsApp(campaign)}
                                  sx={{
                                    bgcolor: "whatsappGreen.main",
                                    color: "white",
                                    "&:hover": {
                                      bgcolor: "#20B858",
                                      boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
                                    },
                                    borderRadius: 20,
                                    py: { xs: 0.3, sm: 0.5, md: 0.8 },
                                    px: { xs: 1, sm: 2, md: 3 },
                                    width: { xs: "100%", sm: "auto" },
                                    fontSize: {
                                      xs: "0.7rem",
                                      sm: "0.8rem",
                                      md: "0.9rem",
                                    },
                                    fontWeight: "bold",
                                  }}
                                >
                                  Share
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
          {selectedSection === "Transactions" && <Transactions />}
          {selectedSection === "Ongoing Campaigns" && <CampaignStatus />}
          {selectedSection === "Learning Modules" && <LearningModules />}
          {selectedSection === "Feedback" && <Feedback />}
          {selectedSection === "FAQ" && <FAQ />}
          <Footer />
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity="success"
            onClose={handleCloseSnackbar}
            sx={{
              fontSize: { xs: "0.7rem", sm: "0.8rem", md: "1rem" },
              bgcolor: "#20b858",
              color: "white",
            }}
          >
            Donation link copied to clipboard
          </Alert>
        </Snackbar>

        <Dialog
          open={rewardsDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "white",
              textAlign: "center",
              p: { xs: 1, sm: 2 },
              fontWeight: 700,
              fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
            }}
          >
            Rewards Program
          </DialogTitle>
          <DialogContent
            sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: "background.default" }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "text.primary",
                textAlign: "center",
                mb: { xs: 1, sm: 2, md: 3 },
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                lineHeight: 1.6,
              }}
            >
              Unlock exciting rewards by reaching donation milestones with
              NayePankh!
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1, sm: 2 },
              }}
            >
              <Card
                sx={{
                  p: { xs: 1, sm: 2 },
                  borderRadius: 2,
                  bgcolor: "white",
                  boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": { transform: "scale(1.02)" },
                  borderLeft: "4px solid #FFD700",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 1, sm: 2 },
                  }}
                >
                  <StarIcon
                    sx={{
                      color: "#FFD700",
                      fontSize: { xs: 20, sm: 24, md: 30 },
                    }}
                  />
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "primary.main",
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" },
                      }}
                    >
                      Star Level
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
                      }}
                    >
                      ₹1,000: Unlock badges & early updates
                    </Typography>
                  </Box>
                </Box>
              </Card>
              <Card
                sx={{
                  p: { xs: 1, sm: 2 },
                  borderRadius: 2,
                  bgcolor: "white",
                  boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": { transform: "scale(1.02)" },
                  borderLeft: "4px solid #FFD700",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 1, sm: 2 },
                  }}
                >
                  <StarIcon
                    sx={{
                      color: "#FFD700",
                      fontSize: { xs: 20, sm: 24, md: 30 },
                    }}
                  />
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "primary.main",
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" },
                      }}
                    >
                      Ninja Level
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
                      }}
                    >
                      ₹5,000: Premium features & certificates
                    </Typography>
                  </Box>
                </Box>
              </Card>
              <Card
                sx={{
                  p: { xs: 1, sm: 2 },
                  borderRadius: 2,
                  bgcolor: "white",
                  boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": { transform: "scale(1.02)" },
                  borderLeft: "4px solid #FFD700",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 1, sm: 2 },
                  }}
                >
                  <StarIcon
                    sx={{
                      color: "#FFD700",
                      fontSize: { xs: 20, sm: 24, md: 30 },
                    }}
                  />
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "primary.main",
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" },
                      }}
                    >
                      Master Level
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
                      }}
                    >
                      ₹10,000: Featured campaigns & VIP perks
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mt: { xs: 1, sm: 2, md: 3 },
                textAlign: "center",
                fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
                lineHeight: 1.6,
              }}
            >
              Share your referral code to climb the ranks faster!
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", p: { xs: 1, sm: 2 } }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCloseDialog}
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "#1E5FA4" },
                borderRadius: 20,
                py: { xs: 0.5, sm: 1 },
                px: { xs: 2, sm: 3 },
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                fontWeight: "bold",
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardPage;
