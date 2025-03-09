const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config(); // Load environment variables from .env file
connectDB(); // Connect to MongoDB

const app = express();

// Middleware
app.use(cors({
  origin:"*", // Allow requests from your frontend (adjust if deployed)
  credentials: true, // Allow cookies or auth headers if needed
}));
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/api/auth", require("./routes/authRoutes")); // Updated to match your auth.js file
app.use("/api/users", require("./routes/userRoutes")); // Updated to match your auth.js file
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/donate", require("./routes/donateRoutes"));
app.use("/api/donations", require("./routes/donationsRoutes"));
app.use("/api/campaign", require("./routes/campaignRoutes")); // Add campaign routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.get("/",(req,res)=>{
  res.send("Server is healthy")
})
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
