const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donorName: {
    type: String,
    required: [true, "Donor name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    match: [
      /^[6-9]\d{9}$/,
      "Please enter a valid 10-digit phone number starting with 6-9",
    ],
  },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  amount: {
    type: Number,
    required: [true, "Donation amount is required"],
    min: [1, "Amount must be at least 1"],
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: [true, "Donation must be linked to a campaign"],
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  paymentId: { type: String, default: null },
  date: { type: Date, default: Date.now },
});

const Donation = mongoose.model("Donation", donationSchema);

module.exports = Donation;
