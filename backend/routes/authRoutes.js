const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
    res.status(401).json({ msg: "Token is not valid" });
  }
};

router.post("/signup", async (req, res) => {
  const { firstname, lastname, email, password,internshipPeriod } = req.body;

  try {
    if (!firstname || !lastname || !email || !password || !internshipPeriod) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Generate or ensure unique referral code
    let referralCode;
    let isUnique = false;
    while (!isUnique) {
      referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingUser = await User.findOne({ referralCode });
      if (!existingUser) isUnique = true;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      referralCode,
      internshipPeriod,
    });

    await user.save();

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, user: { id: user.id, firstname, lastname, email, referralCode } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase();

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch); // Debug log
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// GET /api/auth/user - Get user details
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;