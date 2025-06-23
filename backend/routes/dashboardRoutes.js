const express = require("express");
const {authMiddleware} = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// GET /api/dashboard - Get dashboard info for the authenticated user
// Returns: { message, user }
router.get("/", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        res.json({ message: `Hello ${user.firstname || user.name}, Welcome to your Dashboard!`, user });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.status(500).json({ msg: "Server Error fetching dashboard data", error: err.message });
    }
});

module.exports = router;
