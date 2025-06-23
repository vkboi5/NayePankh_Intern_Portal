// backend/routes/users.js
const express = require("express");
const bcrypt = require("bcryptjs");
const {
  authMiddleware,
  superAdminMiddleware,
  moderatorViewMiddleware,
} = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// GET /api/users - Fetch all users (Super Admin and Moderator only)
// Returns: { users: [userObj, ...] }
router.get("/", [authMiddleware, moderatorViewMiddleware], async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ msg: "Server Error fetching users", error: err.message });
  }
});

// PUT /api/users/:id - Update a user (Super Admin only)
// Body: { firstname?, lastname?, email?, password?, referralCode?, internshipPeriod? }
// Returns: { user: updatedUser, msg }
router.put("/:id", [authMiddleware, superAdminMiddleware], async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password,
    referralCode,
    internshipPeriod,
  } = req.body;
  if (!firstname && !lastname && !email && !password && !referralCode && !internshipPeriod) {
    return res.status(400).json({
      msg: "At least one field must be provided to update",
      missing: ["firstname", "lastname", "email", "password", "referralCode", "internshipPeriod"]
    });
  }
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
    res.status(200).json({ user: updatedUser, msg: "User updated successfully" });
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
    console.error('Error updating user:', err);
    res.status(500).json({ msg: "Server Error updating user", error: err.message });
  }
});

// DELETE /api/users/:id - Delete a user (Super Admin only)
// Returns: { msg }
router.delete(
  "/:id",
  [authMiddleware, superAdminMiddleware],
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ msg: "User not found" });
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ msg: "User deleted successfully" });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ msg: "Server Error deleting user", error: err.message });
    }
  }
);

module.exports = router;
