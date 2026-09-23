/**
 * Calculates when to leave home (Ramat Gan) to pick someone up at TLV.
 */
async function calculateDepartureTime(flightEtaIso) {
  // TODO: Integrate with Google Maps Distance Matrix API for real-time traffic
  // const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  const flightEta = new Date(flightEtaIso);
  
  // Hardcoded values for MVP:
  // Travel time from Ramat Gan to TLV: ~30 minutes
  const travelTimeMinutes = 30;
  
  // Buffer time (parking, walking to arrivals, delays): 20 minutes
  const bufferTimeMinutes = 20;
  
  // Total time needed before landing
  const totalPrepTimeMinutes = travelTimeMinutes + bufferTimeMinutes;
  
  const departureTime = new Date(flightEta.getTime() - totalPrepTimeMinutes * 60000);
  
  return {
    travelTimeMinutes,
    bufferTimeMinutes,
    leaveHomeAt: departureTime.toISOString()
  };
}

module.exports = {
  calculateDepartureTime
};
