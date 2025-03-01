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
  CircularProgress,
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
  AddCircle as AddCircleIcon,
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
import OngoingCampaigns from "./OngoingCampaigns";
import CreateCampaign from "./StartHere";
import bgImg from "../../assets/welcome-img.webp";
import Feedback from "./Feedback";
import LearningModules from "./LearningModules";
import FAQ from "./FAQ";

const drawerWidth = 260;

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
    lightBlue: {
      main: "#BBDEFB", // Light blue for accents
    },
    whatsappGreen: {
      main: "#25D366", // Green for WhatsApp buttons
    },
    referralPink: {
      main: "#d32f2f", // Red for referral code
    },
    text: {
      primary: "#263238", // Darker gray
      secondary: "#546E7A", // Softer gray
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

const FRONTEDN_URL = "https://naye-pankh-intern-portal.vercel.app";

const DashboardPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSection, setSelectedSection] = useState("Dashboard");
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [userDetails, setUserDetails] = useState({
    name: "User",
    email: "",
    referralCode: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [rewardsDialogOpen, setRewardsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!isLoggedIn) return;
      setIsLoading(true);
      try {
        const response = await fetch(`https://naye-pankh-intern-portal-ox93.vercel.app/api/auth/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          const { referralCode } = data.user;
          setUserDetails({
            name: `${data.user.firstname} ${data.user.lastname}`,
            email: data.user.email,
            referralCode: /^[A-Za-z0-9]+$/.test(referralCode) ? referralCode : "",
          });
        } else {
          console.error("Failed to fetch user details:", data.msg);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCampaignData = async () => {
      if (!isLoggedIn) return;
      setIsLoading(true);
      try {
        const response = await fetch("https://naye-pankh-intern-portal-ox93.vercel.app/api/campaign", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setCampaigns(data.campaigns || []);
          setSelectedCampaign(data.campaigns.length > 0 ? data.campaigns[0] : null);
        } else {
          console.error("Failed to fetch campaigns:", data.msg);
        }
      } catch (error) {
        console.error("Error fetching campaign data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
    fetchCampaignData();
  }, [isLoggedIn]);

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
      console.error("Invalid referral code:", userDetails.referralCode);
      return;
    }
    const donationLink = `${FRONTEDN_URL}/donate?ref=${encodeURIComponent(userDetails.referralCode)}`;
    navigator.clipboard.writeText(donationLink);
    setSnackbarOpen(true);
  };

  const handleShareWhatsApp = (campaign) => {
    if (!/^[A-Za-z0-9]+$/.test(userDetails.referralCode)) {
      console.error("Invalid referral code:", userDetails.referralCode);
      return;
    }
    const donationLink = `${FRONTEDN_URL}/donate?ref=${encodeURIComponent(userDetails.referralCode)}`;
    const message = `Support "${campaign?.title || "Our Campaigns"}" with NayePankh Foundation! ${campaign?.description || "Help make a difference."} Goal: ₹${campaign?.goalAmount?.toLocaleString() || "N/A"}, Raised: ₹${campaign?.raisedAmount?.toLocaleString() || "0"}. Donate here: ${donationLink} using referral code ${userDetails.referralCode}. Visit www.nayepankh.org.in for more.`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleShareWhatsAppHero = () => {
    if (!/^[A-Za-z0-9]+$/.test(userDetails.referralCode)) {
      console.error("Invalid referral code:", userDetails.referralCode);
      return;
    }
    const donationLink = `${FRONTEDN_URL}/donate?ref=${encodeURIComponent(userDetails.referralCode)}`;
    const message = `Support "Our Campaigns" with NayePankh Foundation! Help make a difference. Goal: ₹${totalGoalAcrossCampaigns.toLocaleString()}, Raised: ₹${totalRaisedAcrossCampaigns.toLocaleString()}. Donate here: ${donationLink} using referral code ${userDetails.referralCode}. Visit www.nayepankh.org.in for more.`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleRewardsClick = () => setRewardsDialogOpen(true);

  const handleCloseDialog = () => setRewardsDialogOpen(false);

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const getLevelAchieved = (raisedAmount) => {
    if (raisedAmount >= 10000) return "Master";
    if (raisedAmount >= 5000) return "Ninja";
    if (raisedAmount >= 1000) return "Star";
    return "Beginner";
  };

  const totalRaisedAcrossCampaigns = campaigns.reduce(
    (sum, campaign) => sum + (campaign.raisedAmount || 0),
    0
  );
  const totalGoalAcrossCampaigns =
    campaigns.reduce((sum, campaign) => sum + (campaign.goalAmount || 0), 0) || 1;

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon /> },
    { text: "Create Campaign", icon: <AddCircleIcon /> },
    { text: "Transactions", icon: <ListAltIcon /> },
    { text: "Ongoing Campaigns", icon: <ProductionQuantityLimits /> },
    { text: "Learning Modules", icon: <BookOnline /> },
    { text: "Feedback", icon: <Message /> },
    { text: "FAQ", icon: <QuestionMark /> },
  ];

  const drawerContent = (
    <Box sx={{ bgcolor: "#F9F9F9", height: "100%", borderRight: "1px solid #E0E0E0" }}>
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
            fontSize: { xs: "1.5rem", sm: "1.8rem" },
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
                py: { xs: 1.2, sm: 1.5 },
                px: { xs: 2, sm: 3 },
                bgcolor: selectedSection === item.text ? "rgba(33,110,182,0.1)" : "transparent",
                color: selectedSection === item.text ? "primary.main" : "text.secondary",
                "&:hover": {
                  bgcolor: "rgba(33,110,182,0.1)",
                  color: "primary.main",
                },
                transition: "all 0.3s ease",
                borderRadius: 1,
                mx: 1,
              }}
            >
              <ListItemIcon
                sx={{
                  color: selectedSection === item.text ? "primary.main" : "text.secondary",
                  minWidth: { xs: 40, sm: 48 },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: { xs: "0.9rem", sm: "1rem" },
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

  const getCircularProgress = (raised, goal) => {
    const progress = Math.min((raised / goal) * 100, 100) || 0;
    return (
      <Box sx={{ position: "relative", display: "inline-flex", mb: 2 }}>
        <CircularProgress
          variant="determinate"
          value={progress}
          size={80}
          thickness={5}
          sx={{ color: "secondary.main", "& .MuiCircularProgress-circle": { strokeLinecap: "round" } }}
        />
        <CircularProgress
          variant="determinate"
          value={100}
          size={80}
          thickness={5}
          sx={{
            position: "absolute",
            color: "rgba(33,110,182,0.2)",
            "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="caption"
            component="div"
            color="text.primary"
            sx={{ fontSize: { xs: "0.8rem", sm: "1rem" }, fontWeight: 600 }}
          >
            {`${Math.round(progress)}%`}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh" }}>
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
          <Toolbar sx={{ py: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: { xs: 1, sm: 2 }, display: { sm: "none" }, color: "white" }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              sx={{ flexGrow: 1, color: "white", fontWeight: 700, fontSize: { xs: "1.2rem", sm: "1.5rem" }, letterSpacing: 0.5 }}
            >
              Welcome, {userDetails.name}!
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton color="inherit" onClick={handleMenuOpen} sx={{ p: { xs: 0.5, sm: 1 } }}>
                <Avatar
                  alt={userDetails.name}
                  src="/path-to-avatar.jpg"
                  sx={{
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    border: "2px solid white",
                    boxShadow: "0px 0px 12px rgba(255, 255, 255, 0.5)",
                    transition: "all 0.3s ease",
                    "&:hover": { boxShadow: "0px 0px 16px rgba(255, 255, 255, 0.8)" },
                  }}
                />
              </IconButton>
              {isLoggedIn ? (
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  sx={{
                    ml: { xs: 1, sm: 2 },
                    color: "white",
                    borderColor: "white",
                    fontWeight: "bold",
                    borderRadius: 20,
                    fontSize: { xs: "0.8rem", sm: "1rem" },
                    py: { xs: 0.5, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)", borderColor: "white" },
                  }}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleLogin}
                  sx={{
                    ml: { xs: 1, sm: 2 },
                    bgcolor: "white",
                    color: "primary.main",
                    fontWeight: "bold",
                    borderRadius: 20,
                    fontSize: { xs: "0.8rem", sm: "1rem" },
                    py: { xs: 0.5, sm: 1 },
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
                    minWidth: { xs: 180, sm: 220 },
                    border: "1px solid rgba(33,110,182,0.2)",
                  },
                }}
              >
                <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "primary.main", mb: 1, fontSize: { xs: "1rem", sm: "1.1rem" } }}>
                    {userDetails.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                    {userDetails.email}
                  </Typography>
                  <PopoverListItemButton
                    onClick={handleLogout}
                    sx={{
                      py: 1,
                      px: 2,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
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
        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth } }}
          >
            {drawerContent}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth } }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 3, sm: 4 },
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            overflow: "auto",
            mt: { xs: 8, sm: 10 },
            bgcolor: "background.default",
          }}
        >
          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <CircularProgress color="primary" size={48} />
            </Box>
          )}
          <Box sx={{ mb: 4 }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" sx={{ color: "text.secondary" }} />}
              aria-label="breadcrumb"
              sx={{ bgcolor: "white", p: 2, borderRadius: 2, boxShadow: "0px 2px 10px rgba(0,0,0,0.05)" }}
            >
              <Link
                underline="hover"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.9rem", sm: "1rem" }, cursor: "pointer" }}
                onClick={() => handleSectionChange("Dashboard")}
              >
                / Dashboard
              </Link>
              <Typography color="primary.main" sx={{ fontSize: { xs: "0.9rem", sm: "1rem" }, fontWeight: 600 }}>
                {selectedSection}
              </Typography>
            </Breadcrumbs>
          </Box>
          {selectedSection === "Dashboard" && (
            <Box>
              <Card
                sx={{
                  position: "relative",
                  minHeight: { xs: 320, sm: 480 },
                  backgroundImage: `linear-gradient(135deg, rgba(33,110,182,0.85), rgba(66,165,245,0.65)), url(${bgImg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: 3,
                  mb: 4,
                  boxShadow: "0px 8px 25px rgba(0,0,0,0.15)",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  "&:hover": { transform: "scale(1.02)", backdropFilter: "blur(2px)" },
                }}
              >
                <Box
                  sx={{
                    p: { xs: 3, sm: 5 },
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
                      fontWeight: 800,
                      color: "white",
                      mb: 2,
                      textShadow: "3px 3px 8px rgba(0,0,0,0.5)",
                      fontSize: { xs: "2rem", sm: "3.5rem" },
                      letterSpacing: 1,
                    }}
                  >
                    Hello, {userDetails.name}!
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "rgba(255,255,255,0.95)",
                      maxWidth: 600,
                      fontWeight: 400,
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                      mb: 3,
                      textShadow: "1px 1px 4px rgba(0,0,0,0.4)",
                    }}
                  >
                    Every journey begins with a single step—let's make a difference together!
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      fontSize: { xs: "1rem", sm: "1.3rem" },
                      mb: 3,
                      textShadow: "1px 1px 4px rgba(0,0,0,0.4)",
                    }}
                  >
                    Your Referral Code:
                    <strong
                      style={{
                        color: theme.palette.referralPink.main,
                        marginLeft: "12px",
                        padding: "8px 16px",
                        border: `2px solid ${theme.palette.referralPink.main}`,
                        borderRadius: "8px",
                        background: "rgba(211,47,47,0.1)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(211,47,47,0.2)";
                        e.target.style.boxShadow = "0px 0px 12px rgba(211,47,47,0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(211,47,47,0.1)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      {userDetails.referralCode || "Not available"}
                    </strong>
                  </Typography>
                  <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 }, flexWrap: "wrap", justifyContent: "center" }}>
                    <Button
                      variant="contained"
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyLink}
                      sx={{
                        bgcolor: "secondary.main",
                        color: "white",
                        "&:hover": { bgcolor: "#1E88E5", boxShadow: "0px 6px 20px rgba(0,0,0,0.2)" },
                        borderRadius: 25,
                        py: 1.2,
                        px: 3,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        fontWeight: "bold",
                        boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
                        transition: "all 0.3s ease",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                      }}
                    >
                      Copy Link
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<WhatsAppIcon />}
                      onClick={() =>
                        handleShareWhatsAppHero(
                          selectedCampaign || {
                            title: "Our Campaigns",
                            description: "Help make a difference.",
                            goalAmount: 0,
                            raisedAmount: 0,
                          }
                        )
                      }
                      sx={{
                        bgcolor: "whatsappGreen.main",
                        color: "white",
                        "&:hover": { bgcolor: "#20B858", boxShadow: "0px 6px 20px rgba(0,0,0,0.2)" },
                        borderRadius: 25,
                        py: 1.2,
                        px: 3,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        fontWeight: "bold",
                        boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
                        transition: "all 0.3s ease",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                      }}
                    >
                      Share
                    </Button>
                  </Box>
                </Box>
              </Card>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
                        bgcolor: "white",
                        transition: "all 0.3s ease",
                        "&:hover": { transform: "translateY(-5px)", boxShadow: "0px 8px 25px rgba(0,0,0,0.15)" },
                      }}
                    >
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h5"
                          sx={{ color: "primary.main", fontWeight: 700, mb: 2, fontSize: { xs: "1.3rem", sm: "1.5rem" } }}
                        >
                          Total Goal Achieved
                        </Typography>
                        <Box
                          sx={{
                            width: { xs: 150, sm: 200 },
                            height: { xs: 150, sm: 200 },
                            borderRadius: "50%",
                            border: `3px dashed ${theme.palette.secondary.main}`,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            bgcolor: "rgba(33,110,182,0.05)",
                            mx: "auto",
                            transition: "all 0.3s ease",
                            "&:hover": { bgcolor: "rgba(33,110,182,0.1)" },
                          }}
                        >
                          <Typography
                            variant="h3"
                            sx={{ color: "primary.main", fontWeight: 800, fontSize: { xs: "2rem", sm: "2.5rem" } }}
                          >
                            {Math.round((totalRaisedAcrossCampaigns / totalGoalAcrossCampaigns) * 100) || 0}%
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "text.primary", mt: 1, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                          >
                            ₹{totalRaisedAcrossCampaigns.toLocaleString()}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary", fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                          >
                            of ₹{totalGoalAcrossCampaigns.toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
                        bgcolor: "white",
                        transition: "all 0.3s ease",
                        "&:hover": { transform: "translateY(-5px)", boxShadow: "0px 8px 25px rgba(0,0,0,0.15)" },
                      }}
                    >
                      <CardContent sx={{ textAlign: "center" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                          <Typography
                            variant="h5"
                            sx={{ color: "primary.main", fontWeight: 700, fontSize: { xs: "1.3rem", sm: "1.5rem" } }}
                          >
                            Level Achieved
                          </Typography>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleRewardsClick}
                            sx={{
                              bgcolor: "secondary.main",
                              "&:hover": { bgcolor: "#1E88E5" },
                              borderRadius: 20,
                              py: 0.5,
                              px: 2,
                              fontSize: { xs: "0.8rem", sm: "0.9rem" },
                              fontWeight: "bold",
                            }}
                          >
                            Rewards
                          </Button>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
                          <StarIcon sx={{ color: "#FFD700", fontSize: { xs: 28, sm: 36 } }} />
                          <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main", fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                            {getLevelAchieved(totalRaisedAcrossCampaigns)}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", mt: 1, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                        >
                          Unlock levels: Star (₹1,000), Ninja (₹5,000), Master (₹10,000)
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {campaigns.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography
                      variant="h5"
                      sx={{ mb: 3, color: "primary.main", fontWeight: 700, fontSize: { xs: "1.3rem", sm: "1.5rem" } }}
                    >
                      Your Campaigns
                    </Typography>
                    <Grid container spacing={4}>
                      {campaigns.map((campaign) => (
                        <Grid item xs={12} sm={6} md={4} key={campaign._id}>
                          <Card
                            sx={{
                              boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
                              borderRadius: 3,
                              bgcolor: "white",
                              transition: "all 0.3s ease",
                              "&:hover": { transform: "translateY(-5px)", boxShadow: "0px 8px 25px rgba(0,0,0,0.15)" },
                              border: "1px solid rgba(33,110,182,0.1)",
                            }}
                          >
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                              <Typography
                                variant="h6"
                                sx={{ mb: 1.5, color: "primary.main", fontWeight: 600, fontSize: { xs: "1.1rem", sm: "1.3rem" } }}
                              >
                                {campaign.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ mb: 2, color: "text.secondary", fontSize: { xs: "0.8rem", sm: "0.9rem" }, lineHeight: 1.6 }}
                              >
                                {campaign.description}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ mb: 1, fontWeight: 500, fontSize: { xs: "0.8rem", sm: "1rem" } }}
                              >
                                Goal: ₹{campaign.goalAmount.toLocaleString()}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ mb: 2, fontWeight: 500, fontSize: { xs: "0.8rem", sm: "1rem" } }}
                              >
                                Raised: ₹{campaign.raisedAmount.toLocaleString()}
                              </Typography>
                              {getCircularProgress(campaign.raisedAmount, campaign.goalAmount)}
                              <Typography
                                variant="body2"
                                sx={{
                                  textAlign: "center",
                                  color: "text.secondary",
                                  fontWeight: 500,
                                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                }}
                              >
                                {Math.round((campaign.raisedAmount / campaign.goalAmount) * 100) || 0}% Achieved
                              </Typography>
                              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                                <Button
                                  variant="contained"
                                  startIcon={<WhatsAppIcon />}
                                  onClick={() => handleShareWhatsApp(campaign)}
                                  sx={{
                                    bgcolor: "whatsappGreen.main",
                                    color: "white",
                                    "&:hover": { bgcolor: "#20B858" },
                                    borderRadius: 20,
                                    py: 1,
                                    px: 3,
                                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                    fontWeight: "bold",
                                    boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
                                    transition: "all 0.3s ease",
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
                  </Box>
                )}
              </Box>
            </Box>
          )}
          {selectedSection === "Create Campaign" && <CreateCampaign />}
          {selectedSection === "Transactions" && <Transactions />}
          {selectedSection === "Ongoing Campaigns" && <OngoingCampaigns />}
          {selectedSection === "Learning Modules" && <LearningModules />}
          {selectedSection === "Feedback" && <Feedback />}
          {selectedSection === "FAQ" && <FAQ />}
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
            sx={{ fontSize: { xs: "0.8rem", sm: "1rem" }, bgcolor: "secondary.main", color: "white" }}
          >
            Donation link copied to clipboard
          </Alert>
        </Snackbar>

        <Dialog open={rewardsDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: "primary.main", color: "white", textAlign: "center", p: 2, fontWeight: 700, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
            Rewards Program
          </DialogTitle>
          <DialogContent sx={{ p: 3, bgcolor: "background.default" }}>
            <Typography
              variant="body1"
              sx={{ color: "text.primary", textAlign: "center", mb: 3, fontSize: { xs: "0.9rem", sm: "1rem" }, lineHeight: 1.6 }}
            >
              Unlock exciting rewards by reaching donation milestones with NayePankh!
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "white",
                  boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": { transform: "scale(1.02)" },
                  borderLeft: "4px solid #FFD700",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <StarIcon sx={{ color: "#FFD700", fontSize: { xs: 24, sm: 30 } }} />
                  <Box>
                    <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 600, fontSize: { xs: "1rem", sm: "1.2rem" } }}>
                      Star Level
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                      ₹1,000: Unlock badges & early updates
                    </Typography>
                  </Box>
                </Box>
              </Card>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "white",
                  boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": { transform: "scale(1.02)" },
                  borderLeft: "4px solid #FFD700",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <StarIcon sx={{ color: "#FFD700", fontSize: { xs: 24, sm: 30 } }} />
                  <Box>
                    <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 600, fontSize: { xs: "1rem", sm: "1.2rem" } }}>
                      Ninja Level
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                      ₹5,000: Premium features & certificates
                    </Typography>
                  </Box>
                </Box>
              </Card>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "white",
                  boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": { transform: "scale(1.02)" },
                  borderLeft: "4px solid #FFD700",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <StarIcon sx={{ color: "#FFD700", fontSize: { xs: 24, sm: 30 } }} />
                  <Box>
                    <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 600, fontSize: { xs: "1rem", sm: "1.2rem" } }}>
                      Master Level
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                      ₹10,000: Featured campaigns & VIP perks
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 3, textAlign: "center", fontSize: { xs: "0.8rem", sm: "0.9rem" }, lineHeight: 1.6 }}
            >
              Share your referral code to climb the ranks faster!
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", p: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCloseDialog}
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "#1E5FA4" },
                borderRadius: 20,
                py: 1,
                px: 3,
                fontSize: { xs: "0.9rem", sm: "1rem" },
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