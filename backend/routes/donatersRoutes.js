const express = require("express");
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const User = require("../models/User");
const Razorpay = require("razorpay");

const router = express.Router();

// Middleware to authenticate user (optional for public donation, but can be added)
// const authMiddleware = async (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");
//   if (!token) return res.status(401).json({ msg: "No token, authorization denied" });
//
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select("-password");
//     if (!req.user) return res.status(401).json({ msg: "User not found" });
//     next();
//   } catch (err) {
//     res.status(401).json({ msg: "Token is not valid" });
//   }
// };

// Initialize Razorpay with Test Keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_TEST_KEY_ID,
  key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
});

// GET /api/donate/:referralCode - Fetch campaigns by user's referral code
router.get("/:referralCode", async (req, res) => {
  const { referralCode } = req.params;

  try {
    const user = await User.findOne({ referralCode });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const campaigns = await Campaign.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user", "firstname lastname");

    if (!campaigns.length) {
      return res.status(404).json({ msg: "No campaigns found for this user" });
    }

    res.status(200).json({
      campaigns,
      msg: "Campaigns retrieved successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

router.post("/", async (req, res) => {
  const { donorName, amount, campaignId, referralCode, email, phoneNumber } = req.body;

  try {
    if (!donorName || !amount || !campaignId || !referralCode || !email || !phoneNumber) {
      return res.status(400).json({ msg: "All fields (donorName, amount, campaignId, referralCode, email, phoneNumber) are required" });
    }

    const user = await User.findOne({ referralCode });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const campaign = await Campaign.findOne({ _id: campaignId, user: user._id });
    if (!campaign) {
      return res.status(404).json({ msg: "Campaign not found" });
    }

    // Amount is already in paise from the frontend, so no need to multiply by 100
    const amountInPaise = amount; // Assume frontend sends paise

    const order = await razorpay.orders.create({
      amount: amountInPaise, // Already in paise
      currency: "INR",
      receipt: `donation_${Date.now()}`,
    });

    res.status(200).json({
      orderId: order.id,
      amount: amountInPaise, // Return in paise
      donorName,
      campaignId: campaign._id,
      referralCode,
      email,
      phoneNumber,
      msg: "Order created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// POST /api/donate/verify - Verify payment and save donation
router.post("/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donorName, amount, campaignId, referralCode, email, phoneNumber } = req.body;

  try {
    const crypto = require("crypto");
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_TEST_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: "Invalid payment signature" });
    }

    const user = await User.findOne({ referralCode });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ msg: "Campaign not found" });
    }

    const amountInINR = amount / 100; // Convert paise back to rupees for storage

    const donation = new Donation({
      donorName,
      email,
      phoneNumber,
      amount: amountInINR, // Store in rupees
      campaign: campaignId,
      paymentStatus: "completed",
      paymentId: razorpay_payment_id,
    });

    await donation.save();

    campaign.raisedAmount += amountInINR; // Update raisedAmount in rupees
    await campaign.save();

    res.status(201).json({ donation, msg: "Donation processed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;