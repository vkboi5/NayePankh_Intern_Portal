const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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

router.post("/signup", async (req, res) => {
  const { firstname, lastname, email, password, internshipPeriod } = req.body;

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
    });

    await user.save();

    const payload = { id: user.id, role: user.role }; // Include role
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res
      .status(201)
      .json({
        token,
        user: { id: user.id, firstname, lastname, email, referralCode },
      });
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

// Login Route
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

    const payload = { id: user._id, role: user.role }; // Include role
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ msg: "Login successful", token, user });
  } catch (err) {
    console.error('Login error:',err);
    res.status(500).json({ msg: "Server error during login", error: err.message });
  }
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
