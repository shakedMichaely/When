const express = require('express');
const router = express.Router();
const flightService = require('../services/flightService');

router.post('/calculate-departure', async (req, res) => {
  try {
    const { flightNumber } = req.body;
    
    if (!flightNumber) {
      return res.status(400).json({ error: 'flightNumber is required.' });
    }

    // Get real flight data from the API
    const flightInfo = await flightService.getFlightEta(flightNumber);
    
    // We are skipping the travel time calculation for now
    res.json({
      success: true,
      flight: flightInfo,
      message: 'Flight data fetched successfully. Travel calculation is disabled for now.'
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message || 'An error occurred while fetching flight data.' });
  }
});

module.exports = router;
