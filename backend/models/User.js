const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Firstname is required"],
    trim: true,
    minlength: [2, "Firstname must be at least 2 characters long"],
    maxlength: [50, "Firstname cannot exceed 50 characters"],
  },
  lastname: {
    type: String,
    required: [true, "Lastname is required"],
    trim: true,
    minlength: [2, "Lastname must be at least 2 characters long"],
    maxlength: [50, "Lastname cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please enter a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  referralCode: {
    type: String,
    unique: true,
    trim: true,
    default: function () {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    },
  },
}, {
  timestamps: true, 
});

const User = mongoose.model("User", userSchema);

module.exports = User;