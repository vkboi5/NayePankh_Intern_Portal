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
  Popover, // Import Popover for avatar menu
  ListItemButton as PopoverListItemButton, // Rename to avoid conflict
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
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
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Transactions from "./Transactions";
import OngoingCampaigns from "./OngoingCampaigns";
import CreateCampaign from "./StartHere";
import bgImg from "../../assets/campaign.png"; // Ensure this path is correct
import { deepOrange } from "@mui/material/colors";

const drawerWidth = 260;

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
    lightOrange: {
      main: "#FFE5B4", // Light orange for General background and circular loader
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
  const [isLoading, setIsLoading] = useState(false); // For loading state
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;


  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!isLoggedIn) return;
      setIsLoading(true);
      try {
        const response = await fetch(`https://naye-pankh-intern-portal-backend.vercel.app/api/auth/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          const { referralCode } = data.user;
          if (
            !referralCode ||
            typeof referralCode !== "string" ||
            !/^[A-Za-z0-9]+$/.test(referralCode)
          ) {
            console.error("Invalid referral code from backend:", referralCode);
            setUserDetails({
              name: `${data.user.firstname} ${data.user.lastname}`,
              email: data.user.email,
              referralCode: "",
            });
          } else {
            setUserDetails({
              name: `${data.user.firstname} ${data.user.lastname}`,
              email: data.user.email,
              referralCode,
            });
          }
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
        const response = await fetch("https://naye-pankh-intern-portal-backend.vercel.app/api/campaign", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
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

    fetchUserDetails();
    fetchCampaignData();
  }, [isLoggedIn]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget); // Use Popover anchor

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogin = () => navigate("/login");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setAnchorEl(null); // Close popover on logout
  };

  const handleSectionChange = (section) => {
    if (section !== "General") {
      setSelectedSection(section);
      if (mobileOpen) setMobileOpen(false);
    }
  };


  const handleLogoClick = () => navigate("/");

  const handleCopyLink = () => {
    if (
      !userDetails.referralCode ||
      typeof userDetails.referralCode !== "string" ||
      !/^[A-Za-z0-9]+$/.test(userDetails.referralCode)
    ) {
      console.error("Invalid referral code:", userDetails.referralCode);
      return;
    }
    const donationLink = `${FRONTEDN_URL}/donate?ref=${encodeURIComponent(
      userDetails.referralCode
    )}`;
    navigator.clipboard.writeText(donationLink);
    setSnackbarOpen(true);
  };

  const handleShareWhatsApp = (campaign) => {
    if (
      !userDetails.referralCode ||
      typeof userDetails.referralCode !== "string" ||
      !/^[A-Za-z0-9]+$/.test(userDetails.referralCode)
    ) {
      console.error("Invalid referral code:", userDetails.referralCode);
      return;
    }
    const donationLink = `${FRONTEDN_URL}/donate?ref=${encodeURIComponent(
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
    if (
      !userDetails.referralCode ||
      typeof userDetails.referralCode !== "string" ||
      !/^[A-Za-z0-9]+$/.test(userDetails.referralCode)
    ) {
      console.error("Invalid referral code:", userDetails.referralCode);
      return;
    }
    const donationLink = `${FRONTEDN_URL}/donate?ref=${encodeURIComponent(
      userDetails.referralCode
    )}`;
    const message = `Support "${"Our Campaigns"}" with NayePankh Foundation! ${"Help make a difference."} Goal: ₹${totalGoalAcrossCampaigns.toLocaleString()}, Raised: ₹${totalRaisedAcrossCampaigns.toLocaleString()}. Donate here: ${donationLink} using referral code ${
      userDetails.referralCode
    }. Visit www.nayepankh.org.in for more.`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleRewardsClick = () => {
    setRewardsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setRewardsDialogOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

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
    campaigns.reduce((sum, campaign) => sum + (campaign.goalAmount || 0), 0) ||
    1; // Default to 1 to avoid division by zero

  const menuItems = [
    { text: "General" },
    { text: "Dashboard", icon: <DashboardIcon /> },
    { text: "Create Campaign", icon: <AddCircleIcon /> },
    { text: "Transactions", icon: <ListAltIcon /> },
    { text: "Ongoing Campaigns", icon: <ProductionQuantityLimits /> },
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
          boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
        }}
        onClick={handleLogoClick}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "white",
            letterSpacing: 2,
            fontStyle: "normal",
            textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
            fontSize: { xs: "1.5rem", sm: "1.5rem" },
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
                px: { xs: 1, sm: 3 },
                bgcolor:
                  selectedSection === item.text
                    ? "primary.main"
                    : "transparent",
                color: selectedSection === item.text ? "white" : "primary.main",
                "&:hover": {
                  bgcolor:
                    selectedSection === item.text
                      ? "primary.dark"
                      : "rgba(255,153,51,0.1)",
                  color:
                    selectedSection === item.text ? "white" : "primary.main",
                },
                transition: "all 0.3s ease",
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    selectedSection === item.text ? "white" : "primary.main",
                  "&:hover": { color: "primary.main" },
                  minWidth: { xs: 30, sm: 40 }, // Adjust icon size for mobile
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: { xs: "0.9rem", sm: "1.1rem" },
                    fontWeight: selectedSection === item.text ? 700 : 500,
                  },
                }}
              />
            </PopoverListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // Circular progress for individual campaigns with custom colors
  const getCircularProgress = (raised, goal) => {
    const progress = Math.min((raised / goal) * 100, 100) || 0;
    return (
      <Box sx={{ position: "relative", display: "inline-flex", mb: 2 }}>
        <CircularProgress
          variant="determinate"
          value={progress}
          size={100}
          thickness={4}
          sx={{
            color: theme.palette.primary.main, // Filled portion in saffron (#FF9933)
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />
        <CircularProgress
          variant="determinate"
          value={100} // Full circle for background
          size={100}
          thickness={4}
          sx={{
            position: "absolute",
            color: theme.palette.lightOrange.main, // Non-filled portion in light orange (#FFE5B4)
            opacity: 0.5, // Slightly transparent for distinction
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
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
            sx={{ fontSize: { xs: "0.7rem", sm: "0.9rem" } }}
          >
            {`${Math.round(progress)}%`}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        {/* Top Bar */}
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            bgcolor: "primary.main",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: { xs: 1, sm: 2 },
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
                fontWeight: 600,
                fontSize: { xs: "1rem", sm: "1.5rem" },
              }}
            >
              Welcome, {userDetails.name}!
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                sx={{
                  p: { xs: 0.5, sm: 1 },
                }}
              >
                <Avatar
                  alt={userDetails.name}
                  src="/path-to-avatar.jpg" // Replace with actual path
                  sx={{
                    width: { xs: 32, sm: 40 }, // Responsive avatar size
                    height: { xs: 32, sm: 40 },
                    border: "2px solid white",
                    boxShadow: "0px 0px 8px rgba(255, 255, 255, 0.5)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0px 0px 12px rgba(255, 255, 255, 0.7)",
                    },
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
                    ml: { xs: 1, sm: 2 },
                    bgcolor: "white",
                    color: "primary.main",
                    fontWeight: "bold",
                    borderRadius: 20,
                    fontSize: { xs: "0.8rem", sm: "1rem" },
                    py: { xs: 0.5, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    "&:hover": { bgcolor: "#F5F5F5" },
                  }}
                >
                  Login
                </Button>
              )}
              {/* User Menu Popover */}
              <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                sx={{
                  "& .MuiPopover-paper": {
                    borderRadius: 2,
                    boxShadow: "0px 4px 20px rgba(0,0,0,0.15)",
                    bgcolor: "white",
                    minWidth: { xs: 150, sm: 200 },
                  },
                }}
              >
                <Box sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      mb: { xs: 0.5, sm: 1 },
                      fontSize: { xs: "0.9rem", sm: "1.1rem" },
                    }}
                  >
                    {userDetails.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      mb: { xs: 1, sm: 2 },
                      fontSize: { xs: "0.7rem", sm: "0.9rem" },
                    }}
                  >
                    {userDetails.email}
                  </Typography>
                  <PopoverListItemButton
                    onClick={handleLogout}
                    sx={{
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: 1, sm: 2 },
                      fontSize: { xs: "0.8rem", sm: "1rem" },
                      color: "primary.main",
                      "&:hover": {
                        bgcolor: "rgba(255,153,51,0.1)",
                      },
                    }}
                  >
                    Logout
                  </PopoverListItemButton>
                </Box>
              </Popover>
            </Box>
          </Toolbar>
        </AppBar>
        {/* Sidebar */}
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
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 4 },
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            overflow: "auto",
            mt: { xs: 6, sm: 8 }, // Adjust for mobile
            bgcolor: "background.default",
          }}
        >
          {isLoading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: { xs: 2, sm: 4 },
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: { xs: 2, sm: 3 },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                bgcolor: theme.palette.lightOrange.main,
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                borderRadius: 2,
                color: "primary.main",
                fontWeight: 700,
                boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                "&:hover": { bgcolor: "rgba(255,153,51,0.2)" },
                fontSize: { xs: "0.8rem", sm: "1rem" },
              }}
            >
              General / {selectedSection}
            </Typography>
          </Box>
          {selectedSection === "Dashboard" && (
            <Box>
              <Card
                sx={{
                  position: "relative",
                  height: { xs: 300, sm: 550 }, // Reduced height on mobile
                  backgroundImage: `url(${bgImg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: 3,
                  mb: { xs: 2, sm: 4 },
                  boxShadow: "0px 6px 15px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: "rgba(0, 0, 0, 0.4)",
                    borderRadius: 3,
                  }}
                />
                <Box
                  sx={{
                    position: "relative",
                    p: { xs: 2, sm: 4 },
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
                      mb: { xs: 1, sm: 2 },
                      textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                      fontSize: { xs: "1.5rem", sm: "3.5rem" },
                    }}
                  >
                    Hello, {userDetails.name}!
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "rgba(255,255,255,0.9)",
                      maxWidth: { xs: 250, sm: 600 },
                      fontWeight: 300,
                      fontSize: { xs: "0.9rem", sm: "1.25rem" },
                      mb: { xs: 1, sm: 2 },
                    }}
                  >
                    Initial push is the toughest, but every step forward counts!
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "white",
                      fontWeight: 600,
                      fontSize: { xs: "0.9rem", sm: "1.2rem" },
                    }}
                  >
                    Your Referral Code:
                    <strong
                      style={{
                        color: deepOrange[400],
                        marginLeft: "8px",
                        padding: "6px 10px", // Reduced padding for mobile
                        border: `2px solid ${deepOrange[400]}`,
                        borderRadius: "6px",
                        transition:
                          "border-color 0.3s ease, background-color 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = deepOrange[600];
                        e.target.style.backgroundColor =
                          "rgba(255, 165, 0, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = deepOrange[400];
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      {userDetails.referralCode || "Not available"}
                    </strong>
                  </Typography>
                  <Box
                    sx={{
                      mt: { xs: 2, sm: 3 },
                      display: "flex",
                      gap: { xs: 1, sm: 2 },
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyLink}
                      sx={{
                        bgcolor: "white",
                        color: "primary.main",
                        "&:hover": { bgcolor: "#F5F5F5" },
                        borderRadius: 2,
                        py: { xs: 0.5, sm: 1.5 },
                        px: { xs: 1, sm: 2 },
                        fontSize: { xs: "0.8rem", sm: "1rem" },
                        minWidth: { xs: 120, sm: 160 },
                      }}
                    >
                      Copy Donation Link
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
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
                        bgcolor: "secondary.main",
                        "&:hover": { bgcolor: "secondary.dark" },
                        borderRadius: 2,
                        py: { xs: 0.5, sm: 1.5 },
                        px: { xs: 1, sm: 2 },
                        fontSize: { xs: "0.8rem", sm: "1rem" },
                        minWidth: { xs: 120, sm: 160 },
                      }}
                    >
                      Share on WhatsApp
                    </Button>
                  </Box>
                </Box>
              </Card>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: { xs: 2, sm: 4 },
                }}
              >
                {/* Goal Achieved (Total Across All Campaigns) */}
                <Card
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                    bgcolor: "white",
                    transition: "transform 0.3s ease",
                    "&:hover": { transform: "translateY(-5px)" },
                    textAlign: "center",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      sx={{
                        color: "primary.main",
                        fontWeight: 600,
                        mb: { xs: 1, sm: 2 },
                        fontSize: { xs: "1.2rem", sm: "1.5rem" },
                      }}
                    >
                      Total Goal Achieved
                    </Typography>
                    <Box
                      sx={{
                        width: { xs: 150, sm: 200 },
                        height: { xs: 150, sm: 200 },
                        borderRadius: "50%",
                        border: "2px dashed #FF9933",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        bgcolor: "rgba(255,153,51,0.1)",
                        mx: "auto",
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          color: "secondary.main",
                          fontWeight: 700,
                          fontSize: { xs: "1.2rem", sm: "1.8rem" },
                        }}
                      >
                        {Math.round(
                          (totalRaisedAcrossCampaigns /
                            totalGoalAcrossCampaigns) *
                            100
                        ) || 0}
                        %
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "text.primary",
                          mt: { xs: 0.5, sm: 1 },
                          fontSize: { xs: "0.8rem", sm: "1rem" },
                        }}
                      >
                        ₹{totalRaisedAcrossCampaigns.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontSize: { xs: "0.7rem", sm: "0.9rem" },
                        }}
                      >
                        Total Goal ₹{totalGoalAcrossCampaigns.toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Level Achieved & Reward Button */}
                <Card
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                    bgcolor: "white",
                    transition: "transform 0.3s ease",
                    "&:hover": { transform: "translateY(-5px)" },
                  }}
                >
                  <CardContent sx={{ textAlign: "center" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: { xs: 1, sm: 2 },
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          color: "primary.main",
                          fontWeight: 600,
                          fontSize: { xs: "1.2rem", sm: "1.5rem" },
                        }}
                      >
                        Level Achieved
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleRewardsClick}
                        sx={{
                          bgcolor: "primary.main",
                          "&:hover": { bgcolor: "primary.dark" },
                          borderRadius: 2,
                          py: { xs: 0.5, sm: 1 },
                          px: { xs: 1, sm: 2 },
                          fontSize: { xs: "0.8rem", sm: "1rem" },
                        }}
                      >
                        Rewards
                      </Button>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: { xs: 0.5, sm: 1 },
                      }}
                    >
                      <StarIcon
                        sx={{ color: "#FFD700", fontSize: { xs: 20, sm: 30 } }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          fontSize: { xs: "1rem", sm: "1.5rem" },
                        }}
                      >
                        {getLevelAchieved(totalRaisedAcrossCampaigns)}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mt: { xs: 0.5, sm: 1 },
                        fontSize: { xs: "0.7rem", sm: "0.9rem" },
                      }}
                    >
                      Unlock levels with donations: Star (₹1,000), Ninja
                      (₹5,000), Master (₹10,000)
                    </Typography>
                  </CardContent>
                </Card>

                {/* Campaigns Overview (if any) */}
                {campaigns.length > 0 && (
                  <Box sx={{ mt: { xs: 2, sm: 4 } }}>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: { xs: 2, sm: 3 },
                        color: "primary.main",
                        fontWeight: 600,
                        fontSize: { xs: "1.2rem", sm: "1.5rem" },
                      }}
                    >
                      Your Campaigns
                    </Typography>
                    <Grid container spacing={{ xs: 2, sm: 4 }}>
                      {campaigns.map((campaign) => (
                        <Grid item xs={12} sm={6} md={4} key={campaign._id}>
                          <Card
                            sx={{
                              boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
                              borderRadius: 3,
                              bgcolor: "white",
                              transition: "transform 0.3s ease",
                              "&:hover": { transform: "translateY(-5px)" },
                            }}
                          >
                            <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  mb: { xs: 1, sm: 2 },
                                  color: "primary.main",
                                  fontWeight: 600,
                                  fontSize: { xs: "1.1rem", sm: "1.3rem" },
                                }}
                              >
                                {campaign.title}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  mb: { xs: 1, sm: 2 },
                                  color: "text.secondary",
                                  fontSize: { xs: "0.8rem", sm: "1rem" },
                                }}
                              >
                                {campaign.description}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  mb: { xs: 0.5, sm: 1 },
                                  fontWeight: 500,
                                  fontSize: { xs: "0.8rem", sm: "1rem" },
                                }}
                              >
                                Goal: ₹{campaign.goalAmount.toLocaleString()}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  mb: { xs: 1, sm: 2 },
                                  fontWeight: 500,
                                  fontSize: { xs: "0.8rem", sm: "1rem" },
                                }}
                              >
                                Raised: ₹
                                {campaign.raisedAmount.toLocaleString()}
                              </Typography>
                              {getCircularProgress(
                                campaign.raisedAmount,
                                campaign.goalAmount
                              )}
                              <Typography
                                variant="body2"
                                sx={{
                                  mb: { xs: 1, sm: 2 },
                                  textAlign: "center",
                                  color: "text.secondary",
                                  fontSize: { xs: "0.7rem", sm: "0.9rem" },
                                }}
                              >
                                {Math.round(
                                  (campaign.raisedAmount /
                                    campaign.goalAmount) *
                                    100
                                ) || 0}
                                % of goal reached
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: { xs: 1, sm: 2 },
                                  mb: { xs: 1, sm: 2 },
                                  justifyContent: "center",
                                }}
                              >
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  startIcon={<WhatsAppIcon />}
                                  onClick={() => handleShareWhatsApp(campaign)}
                                  sx={{
                                    py: { xs: 0.5, sm: 1.5 },
                                    fontSize: { xs: "0.8rem", sm: "1rem" },
                                    fontWeight: "bold",
                                    borderRadius: 2,
                                    bgcolor: "secondary.main",
                                    "&:hover": {
                                      bgcolor: "secondary.dark",
                                      transform: "scale(1.03)",
                                    },
                                    transition: "all 0.3s ease",
                                    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
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
        </Box>

        {/* Snackbar for Copy Link */}
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
              fontSize: { xs: "0.8rem", sm: "1rem" },
            }}
          >
            Donation link copied to clipboard
          </Alert>
        </Snackbar>

        {/* Rewards Dialog */}
        <Dialog
          open={rewardsDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "white",
              textAlign: "center",
              p: { xs: 2, sm: 4 },
            }}
          >
            NayePankh Rewards Program
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 2, sm: 4 } }}>
            <Typography
              variant="body1"
              sx={{
                color: "text.primary",
                lineHeight: 1.8,
                mb: { xs: 1, sm: 2 },
                fontSize: { xs: "0.8rem", sm: "1rem" },
              }}
            >
              Earn exciting rewards by reaching donation milestones with
              NayePankh:
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1, sm: 2 },
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
                  sx={{ color: "#FFD700", fontSize: { xs: 20, sm: 30 } }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      fontSize: { xs: "1rem", sm: "1.5rem" },
                    }}
                  >
                    Star Level
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "0.7rem", sm: "0.9rem" },
                    }}
                  >
                    Reach ₹1,000 in donations to unlock badges, recognition, and
                    early access to campaign updates.
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, sm: 2 },
                }}
              >
                <StarIcon
                  sx={{ color: "#FFD700", fontSize: { xs: 20, sm: 30 } }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      fontSize: { xs: "1rem", sm: "1.5rem" },
                    }}
                  >
                    Ninja Level
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "0.7rem", sm: "0.9rem" },
                    }}
                  >
                    Reach ₹5,000 in donations for premium features, priority
                    support, and exclusive certificates.
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, sm: 2 },
                }}
              >
                <StarIcon
                  sx={{ color: "#FFD700", fontSize: { xs: 20, sm: 30 } }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      fontSize: { xs: "1rem", sm: "1.5rem" },
                    }}
                  >
                    Master Level
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "0.7rem", sm: "0.9rem" },
                    }}
                  >
                    Reach ₹10,000 in donations for featured campaigns,
                    personalized thank-you videos, and VIP event invitations.
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: "text.primary",
                mt: { xs: 1, sm: 2 },
                lineHeight: 1.8,
                fontSize: { xs: "0.8rem", sm: "1rem" },
              }}
            >
              Track your progress in the Dashboard and share your referral code
              to boost donations and climb the reward ladder!
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", p: { xs: 1, sm: 2 } }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCloseDialog}
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
                borderRadius: 2,
                py: { xs: 0.5, sm: 1.5 },
                fontSize: { xs: "0.8rem", sm: "1rem" },
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