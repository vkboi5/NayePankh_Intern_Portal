// backend/routes/users.js
const express = require("express");
const bcrypt = require("bcryptjs");
const {
  authMiddleware,
  superAdminMiddleware,
} = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// GET /api/users - Fetch all users
router.get("/", [authMiddleware, superAdminMiddleware], async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// PUT /api/users/:id - Update a user (Super Admin only)
router.put("/:id", [authMiddleware, superAdminMiddleware], async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password,
    referralCode,
    internshipPeriod,
  } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    if (referralCode) user.referralCode = referralCode;
    if (internshipPeriod) user.internshipPeriod = internshipPeriod;

    await user.save();
    const updatedUser = await User.findById(req.params.id).select("-password");
    res
      .status(200)
      .json({ user: updatedUser, msg: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// DELETE /api/users/:id - Delete a user (Super Admin only)
router.delete(
  "/:id",
  [authMiddleware, superAdminMiddleware],
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ msg: "User not found" });

      // Replace user.remove() with User.findByIdAndDelete()
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ msg: "User deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

module.exports = router;
