import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Container,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme  from "../../theme"; // Adjust path as needed

const TotalDonations = () => {
  const [donations, setDonations] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch("https://naye-pankh-intern-portal-ox93.vercel.app/api/donations", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setDonations(data.donations);
          const total = data.donations.reduce((sum, donation) => sum + donation.amount, 0);
          setTotalAmount(total);
        } else {
          console.error("Failed to fetch donations:", data.msg);
        }
      } catch (error) {
        console.error("Error fetching donations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
  }, [token]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
        <Container maxWidth="lg">
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
            Total Donations
          </Typography>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress color="primary" size={48} />
            </Box>
          ) : (
            <>
              <Card
                sx={{
                  mb: 4,
                  boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
                  borderRadius: 3,
                  textAlign: "center",
                }}
              >
                <CardContent>
                  <Typography variant="h5" sx={{ color: "primary.main", fontWeight: 700, mb: 1 }}>
                    Total Amount Raised
                  </Typography>
                  <Typography variant="h3" sx={{ color: "primary.main", fontWeight: 800 }}>
                    ₹{totalAmount.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
              {donations.length === 0 ? (
                <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
                  No donations found.
                </Typography>
              ) : (
                <Card sx={{ boxShadow: "0px 4px 15px rgba(0,0,0,0.1)", borderRadius: 3 }}>
                  <CardContent>
                    <TableContainer component={Paper}>
                      <Table sx={{ minWidth: 650 }} aria-label="donations table">
                        <TableHead>
                          <TableRow sx={{ bgcolor: "primary.main" }}>
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Donor Name</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Campaign</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Amount</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {donations.map((donation) => (
                            <TableRow
                              key={donation._id}
                              sx={{
                                "&:hover": { bgcolor: "rgba(33,110,182,0.05)" },
                                transition: "background-color 0.3s",
                              }}
                            >
                              <TableCell>{donation.donorName}</TableCell>
                              <TableCell>{donation.campaign?.title || "Unknown"}</TableCell>
                              <TableCell>₹{donation.amount.toLocaleString()}</TableCell>
                              <TableCell>{new Date(donation.date).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default TotalDonations;