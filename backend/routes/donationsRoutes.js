const express = require("express");
const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

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
    console.error("Token verification error:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// GET /api/donations - Fetch donations based on user's role
// Returns: { donations: [...], msg }
router.get("/", authMiddleware, async (req, res) => {
  try {
    let donations;
    if (req.user.role === "Super Admin" || req.user.role === "Admin") {
      donations = await Donation.find()
        .populate("campaign", "title description goalAmount")
        .populate("donor", "firstname lastname referralCode")
        .sort({ date: -1 });
    } else {
      donations = await Donation.find({ referralCode: req.user.referralCode })
        .populate("campaign", "title description goalAmount")
        .sort({ date: -1 });
    }
    if (!donations.length) {
      return res.status(404).json({
        msg: req.user.role === "Super Admin" || req.user.role === "Admin"
          ? "No donations found"
          : "No donations found for your referral code"
      });
    }
    // Enhance response with campaign details
    const enhancedDonations = donations.map(donation => ({
      ...donation._doc,
      campaign: donation.campaign
        ? {
            title: donation.campaign.title,
            description: donation.campaign.description,
            goalAmount: donation.campaign.goalAmount
          }
        : donation.campaignDetails
    }));
    res.status(200).json({ donations: enhancedDonations, msg: "Donations retrieved successfully" });
  } catch (err) {
    console.error('Error fetching donations:', err);
    res.status(500).json({ msg: "Server Error fetching donations", error: err.message });
  }
});

// GET /api/donations/leaderboard - Fetch leaderboard data
// Returns: { leaderboard: [...] }
router.get("/leaderboard", authMiddleware, async (req, res) => {
  try {
    const leaderboard = await Donation.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: "$referralCode", totalAmount: { $sum: "$amount" } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "referralCode", as: "user" } },
      { $unwind: "$user" },
      { $project: { name: { $concat: ["$user.firstname", " ", "$user.lastname"] }, totalAmount: 1 } },
      { $sort: { totalAmount: -1 } },
    ]);

    if (!leaderboard.length) {
      return res.status(404).json({ msg: "No donation data available for leaderboard" });
    }

    res.status(200).json({ leaderboard });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ msg: "Server Error fetching leaderboard", error: err.message });
  }
});

// GET /api/donations/by-referral/:referralCode - Fetch donations by referral code (for Super Admin)
// Returns: { donations: [...] }
router.get("/by-referral/:referralCode", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "Super Admin" && req.user.role !== "Admin") {
      return res.status(403).json({ msg: "Access denied. Only Super Admin or Moderator can access this endpoint." });
    }
    const { referralCode } = req.params;
    if (!referralCode) {
      return res.status(400).json({ msg: "Missing referralCode parameter", missing: ["referralCode"] });
    }
    const donations = await Donation.find({ referralCode })
      .populate("campaign", "title description goalAmount")
      .sort({ date: -1 });

    res.status(200).json({ donations });
  } catch (err) {
    console.error('Error fetching donations by referral:', err);
    res.status(500).json({ msg: "Server Error fetching donations by referral", error: err.message });
  }
});

module.exports = router;