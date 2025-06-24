const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const router = express.Router();

// Middleware to authenticate user
const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ msg: "User not found" });
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Utility to send OTP
async function sendOTP(email, otp) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your OTP for NayePankh Portal',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #fafdff; padding: 32px 24px; border-radius: 12px; max-width: 420px; margin: 24px auto; box-shadow: 0 2px 12px rgba(33,110,182,0.07);">
        <div style="text-align:center;">
          <h2 style="color: #216eb6; margin: 0 0 8px;">NayePankh Portal</h2>
        </div>
        <p style="font-size: 1.1em; color: #263238; margin-bottom: 18px;">
          <strong>Your One-Time Password (OTP):</strong>
        </p>
        <div style="font-size: 2em; font-weight: bold; color: #1976d2; background: #e3f2fd; padding: 16px 0; border-radius: 8px; letter-spacing: 6px; text-align: center; margin-bottom: 18px;">
          ${otp}
        </div>
        <p style="color: #546E7A; font-size: 0.98em; margin-bottom: 0;">
          Please use this OTP to complete your action. This code is valid for 10 minutes.<br/>
          If you did not request this, you can safely ignore this email.
        </p>
        <div style="margin-top: 24px; text-align: center; color: #bdbdbd; font-size: 0.9em;">
          &copy; ${new Date().getFullYear()} NayePankh Foundation
        </div>
      </div>
    `,
  });
}

// Generate OTP
function generateOTP() {
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

// Registration (Interns: OTP, Others: as is)
router.post("/signup", async (req, res) => {
  const { firstname, lastname, email, password, internshipPeriod, role } = req.body;

  // Validate required fields
  const missing = [];
  if (!firstname) missing.push("firstname");
  if (!lastname) missing.push("lastname");
  if (!email) missing.push("email");
  if (!password) missing.push("password");
  if (!internshipPeriod) missing.push("internshipPeriod");
  if (missing.length) {
    return res.status(400).json({ msg: "Missing required fields", missing });
  }

  try {
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    let referralCode;
    let isUnique = false;
    while (!isUnique) {
      referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingUser = await User.findOne({ referralCode });
      if (!existingUser) isUnique = true;
    }

    const user = new User({
      firstname,
      lastname,
      email,
      password,
      referralCode,
      internshipPeriod,
      role: role || 'Intern',
    });

    if ((role || 'Intern') === 'Intern') {
      // Generate OTP for intern registration
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min
      user.isVerified = false;
      await user.save();
      await sendOTP(email, otp);
      return res.status(201).json({ msg: 'OTP sent to email. Please verify to complete registration.', email });
    } else {
      await user.save();
      const payload = { id: user.id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
      return res.status(201).json({ token, user: { id: user.id, firstname, lastname, email, referralCode } });
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      const internshipPeriodEnum = ["1 week", "2 weeks", "1 month", "3 months", "6 months"];
      const errors = Object.values(err.errors).map(e => {
        const errorObj = { field: e.path, message: e.message };
        if (e.path === 'internshipPeriod' && e.kind === 'enum') {
          errorObj.validValues = internshipPeriodEnum;
        }
        return errorObj;
      });
      return res.status(400).json({ msg: "Validation Error", errors });
    }
    console.error('Signup error:', err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// OTP Verification for Registration
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: 'User not found' });
  if (user.isVerified) return res.status(400).json({ msg: 'User already verified' });
  if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < Date.now()) {
    return res.status(400).json({ msg: 'Invalid or expired OTP' });
  }
  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();
  return res.json({ msg: 'Registration verified. You can now login.' });
});

// Login (Interns: OTP, Others: as is)
router.post("/login", async (req, res) => {
  let { email, password } = req.body;

  // Validate required fields
  const missing = [];
  if (!email) missing.push("email");
  if (!password) missing.push("password");
  if (missing.length) {
    return res.status(400).json({ msg: "Missing required fields", missing });
  }

  email = email.toLowerCase();

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    if (user.role === 'Intern') {
      if (!user.isVerified) return res.status(400).json({ msg: 'Please verify your registration OTP first.' });
      // Generate and send OTP for login
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiry = Date.now() + 10 * 60 * 1000;
      await user.save();
      await sendOTP(email, otp);
      return res.json({ msg: 'OTP sent to email. Please verify to login.', email });
    } else {
      const payload = { id: user._id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
      return res.json({ msg: "Login successful", token, user });
    }
  } catch (err) {
    console.error('Login error:',err);
    res.status(500).json({ msg: "Server error during login", error: err.message });
  }
});

// OTP Verification for Login
router.post('/login-verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: 'User not found' });
  if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < Date.now()) {
    return res.status(400).json({ msg: 'Invalid or expired OTP' });
  }
  user.otp = null;
  user.otpExpiry = null;
  await user.save();
  const payload = { id: user._id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  return res.json({ msg: 'Login successful', token, user });
});

// GET /api/auth/user - Get user details
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ user });
  } catch (err) {
    console.error('Get user error:',err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

module.exports = router;
