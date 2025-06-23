const express = require("express");
const {
  authMiddleware,
  superAdminMiddleware,
} = require("../middleware/authMiddleware");
const Campaign = require("../models/Campaign");

const router = express.Router();

// POST /api/campaign - Create a new campaign (Super Admin only)
// Body: { title, description, goalAmount, startDate, endDate }
// Returns: { campaign, msg }
router.post("/", [authMiddleware, superAdminMiddleware], async (req, res) => {
  const { title, description, goalAmount, startDate, endDate } = req.body;

  // Validate required fields
  const missing = [];
  if (!title) missing.push("title");
  if (!description) missing.push("description");
  if (!goalAmount) missing.push("goalAmount");
  if (!startDate) missing.push("startDate");
  if (!endDate) missing.push("endDate");
  if (missing.length) {
    return res.status(400).json({
      msg: "Missing required fields",
      missing
    });
  }

  try {
    const campaign = new Campaign({
      title,
      description,
      goalAmount,
      user: req.user.id,
      startDate,
      endDate,
    });

    await campaign.save();
    res.status(201).json({ campaign, msg: "Campaign created successfully" });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json({ msg: "Validation Error", errors });
    }
    console.error('Error creating campaign:', err);
    res.status(500).json({ msg: "Server Error creating campaign", error: err.message });
  }
});

// GET /api/campaign - Fetch all campaigns (for Super Admin)
// Returns: { campaigns: [...], msg }
router.get("/", authMiddleware, async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .sort({ createdAt: -1 })
      .populate("user", "firstname lastname referralCode");

    if (!campaigns.length) {
      return res.status(404).json({ msg: "No campaigns found" });
    }

    res.status(200).json({ campaigns, msg: "Campaigns retrieved successfully" });
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).json({ msg: "Server Error fetching campaigns", error: err.message });
  }
});

// PUT /api/campaign/:id - Update a campaign (Super Admin only)
// Body: { title?, description?, goalAmount?, startDate?, endDate? }
// Returns: { campaign, msg }
router.put("/:id", [authMiddleware, superAdminMiddleware], async (req, res) => {
  const { title, description, goalAmount, startDate, endDate } = req.body;
  if (!title && !description && !goalAmount && !startDate && !endDate) {
    return res.status(400).json({
      msg: "At least one field must be provided to update",
      missing: ["title", "description", "goalAmount", "startDate", "endDate"]
    });
  }
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
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json({ msg: "Validation Error", errors });
    }
    console.error('Error updating campaign:', err);
    res.status(500).json({ msg: "Server Error updating campaign", error: err.message });
  }
});

// PUT /api/campaign/:id/extend - Extend campaign end date (Super Admin only)
// Body: { duration }
// Returns: { campaign, msg }
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
          .json({ msg: "Valid positive duration in milliseconds is required", missing: ["duration"] });
      }

      campaign.endDate = new Date(campaign.endDate.getTime() + duration);
      await campaign.save();

      res.status(200).json({ campaign, msg: "Campaign extended successfully" });
    } catch (err) {
      console.error('Error extending campaign:', err);
      res.status(500).json({ msg: "Server Error extending campaign", error: err.message });
    }
  }
);

// DELETE /api/campaign/:id - Delete a campaign (Super Admin only)
// Returns: { msg }
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
      console.error('Error deleting campaign:', err);
      res.status(500).json({ msg: "Server Error deleting campaign", error: err.message });
    }
  }
);

module.exports = router;
