const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");
const User = require("../models/User");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

// PhonePe Sandbox Configuration
const PHONEPE_SANDBOX_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT";
const SALT_KEY = process.env.PHONEPE_SALT_KEY || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

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

// POST /api/donate - Create donation order with PhonePe
router.post("/", async (req, res) => {
  const { donorName, amount, campaignId, referralCode, email, phoneNumber, campaignDetails } = req.body;

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

    // Generate unique transaction ID
    const merchantTransactionId = `DON${Date.now()}`;

    // PhonePe payment payload
    const data = {
      merchantId: MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: donor ? donor._id.toString() : `MUID${Date.now()}`,
      amount: amount, // Amount in paise
      redirectUrl: "http://localhost:5173/donation-success", // Adjust for your frontend
      redirectMode: "REDIRECT",
      callbackUrl: "http://localhost:5000/api/donate/verify", // Server callback for verification
      mobileNumber: phoneNumber,
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const string = payloadMain + "/pg/v1/pay" + SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + SALT_INDEX;

    // Initiate PhonePe payment
    const response = await axios.post(
      `${PHONEPE_SANDBOX_URL}/pg/v1/pay`,
      { request: payloadMain },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          accept: "application/json",
        },
      }
    );

    const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;

    // Save donation record
    const donation = new Donation({
      donorName,
      email,
      phoneNumber,
      donor: donor ? donor._id : null,
      amount: amount / 100, // Convert paise to INR
      campaign: campaignId || null,
      campaignDetails: campaignId ? undefined : donationCampaignDetails,
      referralCode: referralCode || null,
      paymentId: merchantTransactionId,
      paymentStatus: "pending",
    });

    await donation.save();

    res.status(200).json({
      redirectUrl,
      merchantTransactionId,
      msg: "Donation order created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// POST /api/donate/verify - Verify PhonePe payment
router.post("/verify", async (req, res) => {
  const { merchantTransactionId } = req.body; // Sent from frontend or callback

  try {
    const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + SALT_INDEX;

    const response = await axios.get(
      `${PHONEPE_SANDBOX_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": MERCHANT_ID,
          accept: "application/json",
        },
      }
    );

    const paymentStatus = response.data;
    const donation = await Donation.findOne({ paymentId: merchantTransactionId });

    if (!donation) {
      return res.status(404).json({ msg: "Donation not found" });
    }

    if (paymentStatus.code === "PAYMENT_SUCCESS") {
      donation.paymentStatus = "completed";
      donation.paymentId = paymentStatus.data.transactionId || merchantTransactionId;

      if (donation.campaign) {
        const campaign = await Campaign.findById(donation.campaign);
        if (campaign) {
          campaign.raisedAmount += donation.amount;
          await campaign.save();
        }
      }

      await donation.save();
      res.status(200).json({ msg: "Payment verified and donation recorded successfully" });
    } else {
      donation.paymentStatus = "failed";
      await donation.save();
      res.status(400).json({ msg: "Payment failed or pending", status: paymentStatus.code });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;