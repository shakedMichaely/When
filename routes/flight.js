const express = require('express');
const router = express.Router();
const flightService = require('../services/flightService');
const timeService = require('../services/timeService');

router.post('/calculate-departure', async (req, res) => {
  try {
    const { flightNumber, date } = req.body;
    
    if (!flightNumber || !date) {
      return res.status(400).json({ error: 'flightNumber and date are required.' });
    }

    // 1. Get flight ETA
    const flightInfo = await flightService.getFlightEta(flightNumber, date);
    
    // 2. Calculate departure time from Ramat Gan
    const departureInfo = await timeService.calculateDepartureTime(flightInfo.eta);

    res.json({
      flight: flightInfo,
      departure: departureInfo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while calculating departure time.' });
  }
});

module.exports = router;
