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
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// GET /api/donate/:referralCode - Fetch campaigns with referral code
router.get("/:referralCode", async (req, res) => {
  try {
    const { referralCode } = req.params;
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
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// POST /api/donate - Create donation order
router.post("/", async (req, res) => {
  const { donorName, amount, campaignId, referralCode, email, phoneNumber } = req.body;

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ msg: "Campaign not found" });
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
      campaign: campaignId,
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
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// POST /api/donate/verify - Verify payment
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

    const campaign = await Campaign.findById(campaignId);
    campaign.raisedAmount += amount / 100;
    await campaign.save();

    res.status(200).json({ msg: "Payment verified and donation recorded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;