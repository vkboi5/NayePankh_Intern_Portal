// backend/routes/donations.js
const express = require("express");
const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware to authenticate user
const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("Token received:", token); // Debug log
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Debug log
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ msg: "User not found" });
    next();
  } catch (err) {
    console.error("Token verification error:", err.message); // Debug log
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// GET /api/donations - Fetch all donations for the user's campaigns
router.get("/", authMiddleware, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user._id });
    const campaignIds = campaigns.map((campaign) => campaign._id);

    const donations = await Donation.find({ campaign: { $in: campaignIds } })
      .populate("campaign", "title")
      .sort({ date: -1 });

    if (!donations.length) {
      return res.status(404).json({ msg: "No donations found for your campaigns" });
    }

    res.status(200).json({ donations, msg: "Donations retrieved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;