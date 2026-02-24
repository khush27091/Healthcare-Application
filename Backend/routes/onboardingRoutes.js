const express = require('express');
const router = express.Router();
const {
  saveStep1,
  saveStep2,
  saveStep3,
  getProfile,
  completeOnboarding,
  getAllergies,
  getConditions
} = require('../controller/onboardingController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/profile', authMiddleware, getProfile);

router.post('/step1', authMiddleware, saveStep1);
router.post('/step2', authMiddleware, saveStep2);
router.post('/step3', authMiddleware, saveStep3);

router.get("/allergies", authMiddleware, getAllergies);
router.get("/conditions", authMiddleware, getConditions);

router.post('/complete', authMiddleware, completeOnboarding);

module.exports = router;