const express = require("express");
const router = express.Router();
const {
  symptoms,
  pcosSymptomsTypes,
  addSymptom,
  getSymptomsByUser,
  getAllSymptoms,
} = require("../data/symptoms");
const users = require("../data/users");

// Get all symptoms
router.get("/", (req, res) => {
  res.json(getAllSymptoms());
});

// Get symptoms for a specific user
router.get("/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);

  // Check if user exists
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const userSymptoms = getSymptomsByUser(userId);
  res.json(userSymptoms);
});

// Submit a new symptom entry
router.post("/", (req, res) => {
  const {
    userId,
    date,
    symptoms: reportedSymptoms,
    symptomDetails,
    notes,
  } = req.body;

  // Validate required fields
  if (!userId || !date || !reportedSymptoms) {
    return res
      .status(400)
      .json({ message: "userId, date, and symptoms are required" });
  }

  // Check if user exists
  const user = users.find((u) => u.id === parseInt(userId));
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Validate symptoms
  if (!Array.isArray(reportedSymptoms)) {
    return res.status(400).json({ message: "Symptoms must be an array" });
  }

  // Validate that all reported symptoms are in our recognized list
  const invalidSymptoms = reportedSymptoms.filter(
    (s) => !pcosSymptomsTypes.includes(s)
  );
  if (invalidSymptoms.length > 0) {
    return res.status(400).json({
      message: "Some symptoms are not recognized",
      invalidSymptoms,
      validSymptoms: pcosSymptomsTypes,
    });
  }

  // Create proper symptom objects with severities from symptomDetails
  const processedSymptoms = reportedSymptoms.map((symptomName) => {
    // Get severity from symptomDetails if available
    const severityValue =
      symptomDetails &&
      symptomDetails[symptomName] &&
      symptomDetails[symptomName].severity !== undefined
        ? parseFloat(symptomDetails[symptomName].severity)
        : 5;

    return {
      name: symptomName,
      severity: severityValue,
    };
  });

  // Create new symptom entry
  const newSymptom = addSymptom({
    userId: parseInt(userId),
    date,
    symptoms: processedSymptoms, 
    notes,
  });

  res.status(201).json(newSymptom);
});

// Get valid symptom types
router.get("/types", (req, res) => {
  res.json(pcosSymptomsTypes);
});

module.exports = router;
