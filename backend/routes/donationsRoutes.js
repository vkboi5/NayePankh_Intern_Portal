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
      // Super Admin sees all donations
      donations = await Donation.find()
        .populate("campaign", "title")
        .populate("donor", "firstname lastname referralCode")
        .sort({ date: -1 });
    } else {
      // Interns see donations tied to their referral code
      donations = await Donation.find({ referralCode: req.user.referralCode })
        .populate("campaign", "title")
        .sort({ date: -1 });
    }

    if (!donations.length) {
      return res.status(404).json({ 
        msg: req.user.role === "Super Admin" 
          ? "No donations found" 
          : "No donations found for your referral code" 
      });
    }

    res.status(200).json({ donations, msg: "Donations retrieved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;