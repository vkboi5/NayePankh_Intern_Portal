const express = require("express");
const {authMiddleware} = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json({ message: `Hello ${user.name}, Welcome to your Dashboard!`, user });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;
