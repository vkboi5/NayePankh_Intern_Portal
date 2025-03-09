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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Tooltip,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const InternsList = () => {
  const [interns, setInterns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    internshipPeriod: "1 week", // Default value to keep it controlled
  });
  const token = localStorage.getItem("token");

  const internshipPeriods = [
    "1 week",
    "2 weeks",
    "1 month",
    "3 months",
    "6 months",
  ];

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const response = await fetch("https://naye-pankh-intern-portal.vercel.app/api/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          const internList = data.users.filter(
            (user) => user.role === "Intern"
          );
          setInterns(internList);
        } else {
          toast.error(data.msg || "Failed to fetch interns. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching interns:", error);
        toast.error(
          "Network error while fetching interns. Check your connection."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterns();
  }, [token]);

  // Generate referral code
  const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Add Intern
  const handleAddIntern = async () => {
    const { firstname, lastname, email, password, internshipPeriod } = formData;
    if (!firstname || !lastname || !email || !password || !internshipPeriod) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      const referralCode = generateReferralCode();
      const response = await fetch("https://naye-pankh-intern-portal.vercel.app/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          password,
          referralCode,
          internshipPeriod,
          role: "Intern",
        }),
      });
      const data = await response.json();
      if (response.ok) {
        // Ensure internshipPeriod is included in the state update
        setInterns([...interns, { ...data.user, internshipPeriod }]);
        setFormData({
          firstname: "",
          lastname: "",
          email: "",
          password: "",
          internshipPeriod: "1 week",
        });
        setAddDialogOpen(false);
        toast.success("Intern added successfully!");
      } else {
        toast.error(data.msg || "Failed to add intern. Please try again.");
      }
    } catch (error) {
      console.error("Error adding intern:", error);
      toast.error("Network error while adding intern. Check your connection.");
    }
  };

  // Edit Intern
  const handleEditClick = (intern) => {
    setSelectedIntern(intern);
    setFormData({
      firstname: intern.firstname,
      lastname: intern.lastname,
      email: intern.email,
      password: "",
      internshipPeriod: intern.internshipPeriod || "1 week", // Fallback to "1 week" if missing
    });
    setEditDialogOpen(true);
  };

  const handleEditConfirm = async () => {
    if (!selectedIntern?._id) {
      toast.error("No intern selected for update.");
      setEditDialogOpen(false);
      return;
    }
    const { firstname, lastname, email, password, internshipPeriod } = formData;
    if (!firstname || !lastname || !email || !internshipPeriod) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      const response = await fetch(
        `https://naye-pankh-intern-portal.vercel.app/api/users/${selectedIntern._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstname,
            lastname,
            email,
            ...(password && { password }),
            internshipPeriod,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setInterns(
          interns.map((intern) =>
            intern._id === selectedIntern._id
              ? { ...intern, ...data.user, internshipPeriod }
              : intern
          )
        );
        setEditDialogOpen(false);
        toast.success("Intern updated successfully!");
      } else {
        toast.error(data.msg || "Failed to update intern. Please try again.");
      }
    } catch (error) {
      console.error("Error updating intern:", error);
      toast.error(
        "Network error while updating intern. Check your connection."
      );
    }
  };

  // Delete Intern
  const handleDeleteClick = (intern) => {
    setSelectedIntern(intern);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedIntern?._id) {
      toast.error("No intern selected for deletion.");
      setDeleteDialogOpen(false);
      return;
    }
    try {
      const response = await fetch(
        `https://naye-pankh-intern-portal.vercel.app/api/users/${selectedIntern._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setInterns(
          interns.filter((intern) => intern._id !== selectedIntern._id)
        );
        setDeleteDialogOpen(false);
        toast.success("Intern deleted successfully!");
      } else {
        toast.error(data.msg || "Failed to delete intern. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting intern:", error);
      toast.error(
        "Network error while deleting intern. Check your connection."
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          p: { xs: 2, sm: 4, md: 6 },
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              mb: { xs: 3, sm: 5 },
              gap: 2,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "primary.main",
                fontWeight: 700,
                fontSize: { xs: "1.5rem", sm: "2.5rem" },
                textShadow: "1px 1px 4px rgba(0,0,0,0.1)",
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              Interns Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "#1E5FA4" },
                borderRadius: 2,
                px: { xs: 2, sm: 3 },
                py: 1.5,
                fontWeight: 600,
                fontSize: { xs: "0.9rem", sm: "1rem" },
              }}
            >
              Add Intern
            </Button>
          </Box>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress color="primary" size={48} />
            </Box>
          ) : interns.length === 0 ? (
            <Typography
              sx={{
                textAlign: "center",
                color: "text.secondary",
                fontSize: "1.2rem",
                py: 4,
              }}
            >
              No interns found.
            </Typography>
          ) : (
            <Card
              sx={{
                boxShadow: "0px 6px 20px rgba(0,0,0,0.15)",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <TableContainer component={Paper}>
                  <Table
                    sx={{ minWidth: { xs: 300, sm: 650 } }}
                    aria-label="interns table"
                  >
                    <TableHead>
                      <TableRow sx={{ bgcolor: "primary.main" }}>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          }}
                        >
                          Name
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          }}
                        >
                          Email
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          }}
                        >
                          Referral Code
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          }}
                        >
                          Internship Period
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {interns.map((intern) => (
                        <TableRow
                          key={intern._id} // Unique key for each row
                          sx={{
                            "&:hover": { bgcolor: "rgba(33,110,182,0.05)" },
                            transition: "background-color 0.3s",
                          }}
                        >
                          <TableCell
                            sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
                          >
                            {`${intern.firstname} ${intern.lastname}`}
                          </TableCell>
                          <TableCell
                            sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
                          >
                            {intern.email}
                          </TableCell>
                          <TableCell
                            sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
                          >
                            {intern.referralCode}
                          </TableCell>
                          <TableCell
                            sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
                          >
                            {intern.internshipPeriod || "N/A"}{" "}
                            {/* Fallback if missing */}
                          </TableCell>
                          <TableCell>
                            <Tooltip
                              title="Edit Intern Details"
                              enterDelay={300}
                              leaveDelay={200}
                            >
                              <IconButton
                                color="primary"
                                onClick={() => handleEditClick(intern)}
                                sx={{
                                  "&:hover": {
                                    bgcolor: "rgba(33,110,182,0.1)",
                                  },
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title="Delete Intern"
                              enterDelay={300}
                              leaveDelay={200}
                            >
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteClick(intern)}
                                sx={{
                                  "&:hover": { bgcolor: "rgba(211,47,47,0.1)" },
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Container>

        {/* Add Intern Dialog */}
        <Dialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: 3,
              boxShadow: "0px 8px 25px rgba(0,0,0,0.2)",
              width: { xs: "90%", sm: "400px" },
              p: 1,
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 600,
              py: 2,
            }}
          >
            Register New Intern
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="First Name"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
                required
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
              <TextField
                label="Last Name"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                required
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
              <FormControl fullWidth variant="outlined">
                <InputLabel>Internship Period</InputLabel>
                <Select
                  label="Internship Period"
                  name="internshipPeriod"
                  value={formData.internshipPeriod}
                  onChange={handleInputChange}
                  required
                  sx={{
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  }}
                >
                  {internshipPeriods.map((period) => (
                    <MenuItem key={period} value={period}>
                      {period}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
            <Button
              onClick={() => setAddDialogOpen(false)}
              variant="outlined"
              sx={{
                color: "primary.main",
                borderColor: "primary.main",
                "&:hover": { bgcolor: "rgba(33,110,182,0.1)" },
                px: 3,
                py: 1,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddIntern}
              variant="contained"
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "#1E5FA4" },
                px: 3,
                py: 1,
              }}
            >
              Add Intern
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Intern Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: 3,
              boxShadow: "0px 8px 25px rgba(0,0,0,0.2)",
              width: { xs: "90%", sm: "400px" },
              p: 1,
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 600,
              py: 2,
            }}
          >
            Edit Intern Details
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="First Name"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
                required
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
              <TextField
                label="Last Name"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                required
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
              <TextField
                label="New Password (optional)"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
              <FormControl fullWidth variant="outlined">
                <InputLabel>Internship Period</InputLabel>
                <Select
                  label="Internship Period"
                  name="internshipPeriod"
                  value={formData.internshipPeriod}
                  onChange={handleInputChange}
                  required
                  sx={{
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  }}
                >
                  {internshipPeriods.map((period) => (
                    <MenuItem key={period} value={period}>
                      {period}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
            <Button
              onClick={() => setEditDialogOpen(false)}
              variant="outlined"
              sx={{
                color: "primary.main",
                borderColor: "primary.main",
                "&:hover": { bgcolor: "rgba(33,110,182,0.1)" },
                px: 3,
                py: 1,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditConfirm}
              variant="contained"
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "#1E5FA4" },
                px: 3,
                py: 1,
              }}
            >
              Update Intern
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Intern Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: 3,
              boxShadow: "0px 8px 25px rgba(0,0,0,0.2)",
              width: { xs: "90%", sm: "400px" },
              p: 1,
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 600,
              py: 2,
            }}
          >
            Confirm Deletion
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Typography sx={{ color: "text.primary", fontSize: "1.1rem" }}>
              This action is irreversible. Are you sure you want to delete{" "}
              <strong>
                {selectedIntern?.firstname} {selectedIntern?.lastname}
              </strong>
              ?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
              sx={{
                color: "primary.main",
                borderColor: "primary.main",
                "&:hover": { bgcolor: "rgba(33,110,182,0.1)" },
                px: 3,
                py: 1,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              sx={{
                bgcolor: "#D32F2F",
                "&:hover": { bgcolor: "#B71C1C" },
                px: 3,
                py: 1,
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <ToastContainer position="top-right" autoClose={3000} />
      </Box>
    </ThemeProvider>
  );
};

export default InternsList;
