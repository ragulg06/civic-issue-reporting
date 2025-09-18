const express = require("express");
const Complaint = require("../models/Complaint");

const router = express.Router();

// Get all complaints (for admin/testing)
router.get("/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching complaints"
    });
  }
});

// Get complaint by ID
router.get("/complaints/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }
    
    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error("Error fetching complaint:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching complaint"
    });
  }
});

// Update complaint status
router.put("/complaints/:id/status", async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const updateData = { status: status };
    if (notes) {
      updateData.$push = { notes: notes };
    }
    
    const complaint = await Complaint.findOneAndUpdate(
      { complaintId: req.params.id },
      updateData,
      { new: true }
    );
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }
    
    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).json({
      success: false,
      message: "Error updating complaint"
    });
  }
});

module.exports = router;
