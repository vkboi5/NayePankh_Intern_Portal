const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");
const User = require("../models/User");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_TEST_KEY_ID || "rzp_test_Mitv03aBlFFlQ0",
  key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
});

// GET /api/donate/public - Fetch all active campaigns (public access)
// Returns: { campaigns: [...], msg }
router.get("/public", async (req, res) => {
  try {
    const campaigns = await Campaign.find({
      endDate: { $gte: new Date() },
    }).sort({ startDate: -1 });

    if (!campaigns.length) {
      return res.status(404).json({ msg: "No active campaigns found" });
    }

    res.status(200).json({ campaigns, msg: "Campaigns retrieved successfully" });
  } catch (err) {
    console.error('Error fetching public campaigns:', err);
    res.status(500).json({ msg: "Server Error fetching public campaigns", error: err.message });
  }
});

// GET /api/donate/:referralCode - Fetch campaigns with referral code
// Returns: { campaigns: [...], msg }
router.get("/:referralCode", async (req, res) => {
  try {
    const { referralCode } = req.params;
    if (!referralCode) {
      return res.status(400).json({ msg: "Missing referralCode parameter", missing: ["referralCode"] });
    }
    const user = await User.findOne({ referralCode });
    if (!user) {
      return res.status(400).json({ msg: "Invalid referral code" });
    }

    const campaigns = await Campaign.find({
      endDate: { $gte: new Date() },
    }).sort({ startDate: -1 });

    if (!campaigns.length) {
      return res.status(404).json({ msg: "No active campaigns found" });
    }

    res.status(200).json({ campaigns, msg: "Campaigns retrieved successfully" });
  } catch (err) {
    console.error('Error fetching campaigns by referral code:', err);
    res.status(500).json({ msg: "Server Error fetching campaigns by referral code", error: err.message });
  }
});

// POST /api/donate - Create donation order
// Body: { donorName, amount, campaignId?, referralCode?, email, phoneNumber, campaignDetails? }
// Returns: { orderId, amount, msg }
router.post("/", async (req, res) => {
  const { donorName, amount, campaignId, referralCode, email, phoneNumber, campaignDetails } = req.body;

  // Validate required fields
  const missing = [];
  if (!donorName) missing.push("donorName");
  if (!amount) missing.push("amount");
  if (!email) missing.push("email");
  if (!phoneNumber) missing.push("phoneNumber");
  if (missing.length) {
    return res.status(400).json({ msg: "Missing required fields", missing });
  }

  try {
    let campaign = null;
    let donationCampaignDetails = {
      title: "Custom Donation",
      description: "A custom donation without a specific campaign",
      goalAmount: null,
    };

    if (campaignId) {
      campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return res.status(404).json({ msg: "Campaign not found" });
      }
      // If campaign exists, don't use campaignDetails from request
    } else if (campaignDetails) {
      donationCampaignDetails = {
        title: campaignDetails.title || "Custom Donation",
        description: campaignDetails.description || "A custom donation without a specific campaign",
        goalAmount: campaignDetails.goalAmount || null,
      };
    }

    let donor = null;
    if (referralCode) {
      donor = await User.findOne({ referralCode });
      if (!donor) {
        return res.status(400).json({ msg: "Invalid referral code" });
      }
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `donation_${Date.now()}`,
    });

    const donation = new Donation({
      donorName,
      email,
      phoneNumber,
      donor: donor ? donor._id : null,
      amount: amount / 100,
      campaign: campaignId || null,
      campaignDetails: campaignId ? undefined : donationCampaignDetails,
      referralCode: referralCode || null,
      paymentId: order.id,
      paymentStatus: "pending",
    });

    await donation.save();

    res.status(200).json({
      orderId: order.id,
      amount,
      msg: "Donation order created successfully",
    });
  } catch (err) {
    console.error('Error creating donation order:', err);
    res.status(500).json({ msg: "Server Error creating donation order", error: err.message });
  }
});

// POST /api/donate/verify - Verify payment
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, donorName, amount, campaignId?, referralCode?, email, phoneNumber }
// Returns: { msg }
router.post("/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    donorName,
    amount,
    campaignId,
    referralCode,
    email,
    phoneNumber,
  } = req.body;

  // Validate required fields
  const missing = [];
  if (!razorpay_order_id) missing.push("razorpay_order_id");
  if (!razorpay_payment_id) missing.push("razorpay_payment_id");
  if (!razorpay_signature) missing.push("razorpay_signature");
  if (!donorName) missing.push("donorName");
  if (!amount) missing.push("amount");
  if (!email) missing.push("email");
  if (!phoneNumber) missing.push("phoneNumber");
  if (missing.length) {
    return res.status(400).json({ msg: "Missing required fields", missing });
  }

  try {
    if (!process.env.RAZORPAY_TEST_KEY_SECRET) {
      console.error("RAZORPAY_KEY_SECRET is not defined in environment variables");
      return res.status(500).json({ msg: "Server configuration error: Payment secret key missing" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_TEST_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: "Invalid payment signature" });
    }

    const donation = await Donation.findOne({ paymentId: razorpay_order_id });
    if (!donation) {
      return res.status(404).json({ msg: "Donation not found" });
    }

    donation.paymentStatus = "completed";
    donation.paymentId = razorpay_payment_id;
    await donation.save();

    // Update campaign raised amount only if campaignId is provided
    if (campaignId) {
      const campaign = await Campaign.findById(campaignId);
      if (campaign) {
        campaign.raisedAmount += amount / 100;
        await campaign.save();
      }
    }

    res.status(200).json({ msg: "Payment verified and donation recorded successfully" });
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ msg: "Server Error verifying payment no API keys", error: err.message });
  }
});

module.exports = router;