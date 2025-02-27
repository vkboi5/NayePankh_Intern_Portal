// backend/routes/campaign.js
const express = require("express");
const jwt = require("jsonwebtoken");
const Campaign = require("../models/Campaign");
const User = require("../models/User");

const router = express.Router();

// Middleware to authenticate user
const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ msg: "User not found" });
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// POST /api/campaign - Create a new campaign
router.post("/", authMiddleware, async (req, res) => {
  const { title, description, goalAmount, startDate, endDate } = req.body;

  try {
    if (!title || !description || !goalAmount || !startDate || !endDate) {
      return res
        .status(400)
        .json({ msg: "All fields (title, description, goalAmount, startDate, endDate) are required" });
    }

    // No longer generating referralCode here; it’s now tied to the user
    const campaign = new Campaign({
      title,
      description,
      goalAmount,
      user: req.user._id,
      startDate,
      endDate,
    });

    await campaign.save();
    res.status(201).json({ campaign, msg: "Campaign created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// GET /api/campaign - Fetch all campaigns for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("user", "firstname lastname referralCode");
    if (!campaigns.length) {
      return res.status(404).json({ msg: "No campaigns found for this user" });
    }

    res.status(200).json({ campaigns, msg: "Campaigns retrieved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// PUT /api/campaign/:id/extend - Extend campaign end date
router.put("/:id/extend", authMiddleware, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, user: req.user._id });
    if (!campaign) return res.status(404).json({ msg: "Campaign not found" });

    const { duration } = req.body; // Expect duration in milliseconds
    if (!duration || typeof duration !== "number" || duration <= 0) {
      return res.status(400).json({ msg: "Valid positive duration in milliseconds is required" });
    }

    campaign.endDate = new Date(campaign.endDate.getTime() + duration);
    await campaign.save();

    res.status(200).json({ campaign, msg: "Campaign extended successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;