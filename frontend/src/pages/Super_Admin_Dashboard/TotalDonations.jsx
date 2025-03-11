import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Container,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Chip,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme"; // Ensure this matches your theme file

const TotalDonations = () => {
  const [allDonations, setAllDonations] = useState([]);
  const [referralTotal, setReferralTotal] = useState(0);
  const [nonReferralTotal, setNonReferralTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/donations", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          const donations = data.donations || [];
          setAllDonations(donations);

          // Calculate totals
          const referralSum = donations
            .filter((d) => d.referralCode)
            .reduce((sum, d) => sum + d.amount, 0);
          const nonReferralSum = donations
            .filter((d) => !d.referralCode)
            .reduce((sum, d) => sum + d.amount, 0);
          setReferralTotal(referralSum);
          setNonReferralTotal(nonReferralSum);
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
            Total Donations Overview
          </Typography>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress color="primary" size={48} />
            </Box>
          ) : (
            <>
              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ boxShadow: "0px 4px 15px rgba(0,0,0,0.1)", borderRadius: 3, textAlign: "center" }}>
                    <CardContent>
                      <Typography variant="h5" sx={{ color: "primary.main", fontWeight: 700, mb: 1 }}>
                        Referral-Based Total
                      </Typography>
                      <Typography variant="h3" sx={{ color: "primary.main", fontWeight: 800 }}>
                        ₹{referralTotal.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ boxShadow: "0px 4px 15px rgba(0,0,0,0.1)", borderRadius: 3, textAlign: "center" }}>
                    <CardContent>
                      <Typography variant="h5" sx={{ color: "primary.main", fontWeight: 700, mb: 1 }}>
                        Non-Referral Total
                      </Typography>
                      <Typography variant="h3" sx={{ color: "primary.main", fontWeight: 800 }}>
                        ₹{nonReferralTotal.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Merged Donations Table */}
              <Typography variant="h5" sx={{ mb: 2, color: "primary.main", fontWeight: 600 }}>
                All Donations
              </Typography>
              {allDonations.length === 0 ? (
                <Typography sx={{ textAlign: "center", color: "text.secondary", mb: 4 }}>
                  No donations found.
                </Typography>
              ) : (
                <Card sx={{ boxShadow: "0px 4px 15px rgba(0,0,0,0.1)", borderRadius: 3 }}>
                  <CardContent>
                    <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="all donations table">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "primary.main" }}>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Donor Name</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Campaign Title</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Goal Amount</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Amount</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Referral Code</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allDonations.map((donation) => (
                        <TableRow
                          key={donation._id}
                          sx={{ "&:hover": { bgcolor: "rgba(33,110,182,0.05)" }, transition: "background-color 0.3s" }}
                        >
                          <TableCell>{donation.donorName || "Anonymous"}</TableCell>
                          <TableCell>{donation.campaign.title}</TableCell>
                          <TableCell>{donation.campaign.description}</TableCell>
                          <TableCell>{donation.campaign.goalAmount ? `₹${donation.campaign.goalAmount.toLocaleString()}` : "N/A"}</TableCell>
                          <TableCell>₹{donation.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip
                              label={donation.referralCode ? "Referral" : "Non-Referral"}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.8rem",
                                color: "white",
                                bgcolor: donation.referralCode
                                  ? "linear-gradient(45deg, #42A5F5 30%, #2196F3 90%)"
                                  : "linear-gradient(45deg, #FF7043 30%, #F4511E 90%)",
                                background: donation.referralCode
                                  ? "linear-gradient(45deg, #42A5F5 30%, #2196F3 90%)"
                                  : "linear-gradient(45deg, #FF7043 30%, #F4511E 90%)",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                borderRadius: "16px",
                                padding: "0 8px",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                                },
                                transition: "all 0.2s ease-in-out",
                              }}
                            />
                          </TableCell>
                          <TableCell>{donation.referralCode || "N/A"}</TableCell>
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