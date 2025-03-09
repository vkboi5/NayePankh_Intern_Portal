const express = require("express");
const {
  authMiddleware,
  superAdminMiddleware,
} = require("../middleware/authMiddleware");
const Campaign = require("../models/Campaign");

const router = express.Router();

// POST /api/campaign - Create a new campaign (Super Admin only)
router.post("/", [authMiddleware, superAdminMiddleware], async (req, res) => {
  const { title, description, goalAmount, startDate, endDate } = req.body;

  try {
    if (!title || !description || !goalAmount || !startDate || !endDate) {
      return res.status(400).json({
        msg: "All fields (title, description, goalAmount, startDate, endDate) are required",
      });
    }

    const campaign = new Campaign({
      title,
      description,
      goalAmount,
      user: req.user.id, // Assign to the Super Admin who creates it
      startDate,
      endDate,
    });

    await campaign.save();
    res.status(201).json({ campaign, msg: "Campaign created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// GET /api/campaign - Fetch all campaigns (for Super Admin)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .sort({ createdAt: -1 })
      .populate("user", "firstname lastname referralCode");

    if (!campaigns.length) {
      return res.status(404).json({ msg: "No campaigns found" });
    }

    res
      .status(200)
      .json({ campaigns, msg: "Campaigns retrieved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// PUT /api/campaign/:id - Update a campaign (Super Admin only)
router.put("/:id", [authMiddleware, superAdminMiddleware], async (req, res) => {
  const { title, description, goalAmount, startDate, endDate } = req.body;

  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ msg: "Campaign not found" });

    if (title) campaign.title = title;
    if (description) campaign.description = description;
    if (goalAmount) campaign.goalAmount = goalAmount;
    if (startDate) campaign.startDate = startDate;
    if (endDate) campaign.endDate = endDate;

    await campaign.save();
    res.status(200).json({ campaign, msg: "Campaign updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// PUT /api/campaign/:id/extend - Extend campaign end date (Super Admin only)
router.put(
  "/:id/extend",
  [authMiddleware, superAdminMiddleware],
  async (req, res) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      if (!campaign) return res.status(404).json({ msg: "Campaign not found" });

      const { duration } = req.body;
      if (!duration || typeof duration !== "number" || duration <= 0) {
        return res
          .status(400)
          .json({ msg: "Valid positive duration in milliseconds is required" });
      }

      campaign.endDate = new Date(campaign.endDate.getTime() + duration);
      await campaign.save();

      res.status(200).json({ campaign, msg: "Campaign extended successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// DELETE /api/campaign/:id - Delete a campaign (Super Admin only)
router.delete(
  "/:id",
  [authMiddleware, superAdminMiddleware],
  async (req, res) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      if (!campaign) return res.status(404).json({ msg: "Campaign not found" });

      await Campaign.findByIdAndDelete(req.params.id);
      res.status(200).json({ msg: "Campaign deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

module.exports = router;
