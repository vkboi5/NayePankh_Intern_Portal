import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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

function Transactions() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view transactions");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("https://naye-pankh-intern-portal-ox93.vercel.app/api/donations", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setDonations(data.donations || []);
        } else {
          setError(data.msg || "Failed to load transactions");
        }
      } catch (err) {
        setError("Failed to fetch transactions");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
        <Typography
          variant="h5"
          sx={{
            mb: { xs: 2, sm: 3 },
            textAlign: "center",
            color: "primary.main",
            fontWeight: 700,
            fontSize: { xs: "1.2rem", sm: "1.5rem" },
          }}
        >
          Transactions
        </Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: { xs: 150, sm: 200 } }}>
            <CircularProgress color="primary" size={40} />
          </Box>
        ) : error ? (
          <Typography
            color="error"
            sx={{
              textAlign: "center",
              fontSize: { xs: "0.9rem", sm: "1.1rem" },
              fontWeight: 500,
            }}
          >
            {error}
          </Typography>
        ) : donations.length === 0 ? (
          <Typography
            sx={{
              textAlign: "center",
              fontSize: { xs: "0.9rem", sm: "1.1rem" },
              color: "text.secondary",
              mb: { xs: 2, sm: 4 },
            }}
          >
            No transactions found for your campaigns.
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
              borderRadius: 2,
              overflowX: "auto", // Enable horizontal scrolling on mobile
            }}
          >
            <Table sx={{ minWidth: 300 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.8rem", sm: "1rem" } }}>Donor</TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.8rem", sm: "1rem" } }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.8rem", sm: "1rem" } }}>Campaign</TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.8rem", sm: "1rem" } }}>Transaction ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.8rem", sm: "1rem" } }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation._id}>
                    <TableCell sx={{ fontSize: { xs: "0.7rem", sm: "0.9rem" } }}>{donation.donorName || "Anonymous"}</TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.7rem", sm: "0.9rem" } }}>₹{(donation.amount || 0).toLocaleString()}</TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.7rem", sm: "0.9rem" } }}>{donation.campaign?.title || "Unknown Campaign"}</TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.7rem", sm: "0.9rem" } }}>{donation.paymentId || "Unknown"}</TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.7rem", sm: "0.9rem" } }}>{donation.date ? new Date(donation.date).toLocaleString() : "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default Transactions;