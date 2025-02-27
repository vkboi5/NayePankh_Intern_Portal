import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  Box,
  Divider,
  Link, // Import Link for navigation
} from "@mui/material";
import { Menu as MenuIcon, VolunteerActivism as VolunteerActivismIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { orange } from "@mui/material/colors";

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogin = () => navigate("/login");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleNavClick = (sectionId) => {
    navigate("/"); // Navigate to homepage first
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 100); // Small delay to ensure page loads
  };

  const handleDanaMitraClick = () => {
    navigate("/"); // Navigate to homepage when DanaMitra is clicked
  };

  const navLinks = [
    { text: "Home", path: "/", sectionId: "home" },
    { text: "About", path: "/", sectionId: "about" },
    { text: "Campaigns", path: "/", sectionId: "campaigns" },
    { text: "How It Works", path: "/", sectionId: "how-it-works" },
    { text: "Contact", path: "/", sectionId: "contact" },
  ];

  return (
    <>
      <AppBar
        position="static"
        sx={{
          bgcolor: "#fff4e6",
          color: "white",
          boxShadow: "0px 4px 15px rgba(0,0,0,0.15)",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            py: 2,
            px: { xs: 2, md: 4 },
            alignItems: "center", // Ensure vertical alignment in mobile view
          }}
        >
          {/* DanaMitra as a Link, aligned with toggle button in mobile */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center", // Align vertically with toggle button
              flexGrow: 1, // Allow text to grow and center on mobile
            }}
          >
            <Link
              onClick={handleDanaMitraClick}
              sx={{
                textDecoration: "none",
              }}
            >
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  color: "orange",
                  fontWeight: 800,
                  textAlign: "center",
                  mb: 0, // Remove margin for better alignment
                  fontSize: { xs: "1.0rem", md: "2.0rem" },
                  cursor: "pointer", // Indicate clickable
                  transition: "color 0.3s ease", // Smooth color transition on hover
                }}
              >
                NayePankh
              </Typography>
            </Link>
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3, alignItems: "center" }}>
            {navLinks.map((link) => (
              <Button
                key={link.text}
                onClick={() => handleNavClick(link.sectionId)}
                sx={{
                  color: "orange",
                  textTransform: "uppercase",
                  fontWeight: 550,
                  fontSize: "1rem",
                  position: "relative",
                  "&:hover": {
                    color: orange[900],
                    "&::after": {
                      width: "100%",
                    },
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    width: "0",
                    height: "2px",
                    bottom: "-4px",
                    left: 0,
                    bgcolor: orange[900],
                    transition: "width 0.3s ease",
                  },
                }}
              >
                {link.text}
              </Button>
            ))}
            {isLoggedIn ? (
              <Button
                variant="outlined"
                onClick={handleLogout}
                sx={{
                  color: "orange",
                  borderColor: orange[700],
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  borderRadius: 50,
                  py: 1,
                  px: 3,
                  "&:hover": {
                    color: "white",
                    bgcolor: orange[600],
                    borderColor: "white",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                variant="outlined" // Changed to outlined to match Logout styling
                onClick={handleLogin}
                sx={{
                  color: "orange",
                  borderColor: orange[700],
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  borderRadius: 50,
                  py: 1,
                  px: 3,
                  "&:hover": {
                    color: "white",
                    bgcolor: orange[600],
                    borderColor: "white",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Login
              </Button>
            )}
          </Box>

          <IconButton
            edge="end"
            aria-label="Open menu"
            onClick={toggleDrawer(true)}
            sx={{ display: { xs: "flex", md: "none" }, color: orange[600] }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 280,
            bgcolor: "background.default",
            height: "100%",
            boxShadow: "-2px 0px 10px rgba(0,0,0,0.1)",
          }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box
            sx={{
              p: 3,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "white", textTransform: "uppercase" }}
            >
              NayePankh
            </Typography>
          </Box>
          <List sx={{ py: 2 }}>
            {navLinks.map((link) => (
              <ListItem key={link.text} disablePadding>
                <Button
                  onClick={() => handleNavClick(link.sectionId)}
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    textTransform: "uppercase",
                    color: "primary.main",
                    fontWeight: 500,
                    py: 1.5,
                    px: 3,
                    "&:hover": {
                      bgcolor: "rgba(255,153,51,0.1)",
                      color: "primary.dark",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {link.text}
                </Button>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ borderColor: "rgba(255,153,51,0.2)" }} />
          <List>
            <ListItem disablePadding>
              <Button
                variant="contained"
                startIcon={<VolunteerActivismIcon />}
                fullWidth
                sx={{
                  m: 2,
                  bgcolor: "primary.main",
                  color: "white",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  borderRadius: 2,
                  py: 1.5,
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Donate Now
              </Button>
            </ListItem>
            <ListItem disablePadding>
              {isLoggedIn ? (
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  fullWidth
                  sx={{
                    m: 2,
                    color: "primary.main",
                    borderColor: "primary.main",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    borderRadius: 2,
                    py: 1.5,
                    "&:hover": {
                      bgcolor: "rgba(255,153,51,0.1)",
                      borderColor: "primary.dark",
                    },
                  }}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  variant="outlined" // Changed to outlined to match Logout styling
                  onClick={handleLogin}
                  fullWidth
                  sx={{
                    m: 2,
                    color: "orange",
                    borderColor: orange[700],
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    borderRadius: 2,
                    py: 1.5,
                    "&:hover": {
                      color: "white",
                      bgcolor: orange[600],
                      borderColor: "white",
                    },
                  }}
                >
                  Login
                </Button>
              )}
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}