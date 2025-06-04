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
router.get("/", authMiddleware, async (req, res) => {
  try {
    let donations;

    if (req.user.role === "Super Admin") {
      donations = await Donation.find()
        .populate("campaign", "title description goalAmount") // Populate if campaign exists
        .populate("donor", "firstname lastname referralCode")
        .sort({ date: -1 });
    } else {
      donations = await Donation.find({ referralCode: req.user.referralCode })
        .populate("campaign", "title description goalAmount")
        .sort({ date: -1 });
    }

    if (!donations.length) {
      return res.status(404).json({ 
        msg: req.user.role === "Super Admin" 
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
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// GET /api/donations/leaderboard - Fetch leaderboard data
router.get("/leaderboard", authMiddleware, async (req, res) => {
  try {
    const leaderboard = await Donation.aggregate([
      {
        $match: { paymentStatus: "completed" }, // Only count completed payments
      },
      {
        $group: {
          _id: "$referralCode", // Group by referralCode
          totalAmount: { $sum: "$amount" }, // Sum amounts in INR
        },
      },
      {
        $lookup: {
          from: "users", // Join with User collection
          localField: "_id",
          foreignField: "referralCode",
          as: "user",
        },
      },
      {
        $unwind: "$user", // Flatten the user array
      },
      {
        $project: {
          name: { $concat: ["$user.firstname", " ", "$user.lastname"] },
          totalAmount: 1,
        },
      },
      {
        $sort: { totalAmount: -1 }, // Sort by totalAmount descending
      },
    ]);

    if (!leaderboard.length) {
      return res.status(404).json({ msg: "No donation data available for leaderboard" });
    }

    res.status(200).json({ leaderboard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// GET /api/donations/by-referral/:referralCode - Fetch donations by referral code (for Super Admin)
router.get("/by-referral/:referralCode", authMiddleware, async (req, res) => {
  try {
    // Only allow Super Admin to use this endpoint
    if (req.user.role !== "Super Admin") {
      return res.status(403).json({ msg: "Access denied" });
    }
    const { referralCode } = req.params;
    const donations = await Donation.find({ referralCode })
      .populate("campaign", "title description goalAmount")
      .sort({ date: -1 });

    res.status(200).json({ donations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;