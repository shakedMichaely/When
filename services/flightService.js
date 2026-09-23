/**
 * Fetches flight information from an external API.
 */
async function getFlightEta(flightNumber, date) {
  // TODO: Integrate with real API like AviationStack or FlightLabs
  // const apiKey = process.env.FLIGHT_API_KEY;
  // const response = await axios.get(`API_URL?access_key=${apiKey}&flight_iata=${flightNumber}`);
  
  console.log(`Fetching data for flight ${flightNumber} on ${date}`);

  // Mocking the response for MVP
  // Assuming the flight lands in 4 hours from now
  const eta = new Date();
  eta.setHours(eta.getHours() + 4);

  return {
    flightNumber,
    status: 'scheduled',
    eta: eta.toISOString(),
  };
}

module.exports = {
  getFlightEta
};
