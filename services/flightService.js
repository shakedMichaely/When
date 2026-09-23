const axios = require('axios');

/**
 * Fetches flight information from an external API (AviationStack).
 */
async function getFlightEta(flightNumber) {
  const apiKey = process.env.FLIGHT_API_KEY;
  if (!apiKey) {
    throw new Error('FLIGHT_API_KEY is not configured in .env');
  }

  // Note: AviationStack free tier uses HTTP
  const url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}`;
  
  console.log(`Fetching data for flight ${flightNumber} from AviationStack...`);
  const response = await axios.get(url);
  
  console.log("API RAW DATA:", JSON.stringify(response.data, null, 2));

  const flightData = response.data.data;
  
  if (!flightData || flightData.length === 0) {
    throw new Error(`No flight data found for flight number: ${flightNumber}`);
  }

  // Get the most relevant flight object (usually the first one)
  const flight = flightData[0];
  
  return {
    flightNumber: flight.flight.iata,
    airline: flight.airline.name,
    origin: flight.departure.airport,
    originIata: flight.departure.iata,
    destination: flight.arrival.airport,
    destinationIata: flight.arrival.iata,
    status: flight.flight_status,
    departureScheduled: flight.departure.scheduled,
    departureActual: flight.departure.actual,
    departureDelay: flight.departure.delay,
    eta: flight.arrival.estimated || flight.arrival.scheduled,
    arrivalDelay: flight.arrival.delay,
    arrivalTerminal: flight.arrival.terminal,
    arrivalGate: flight.arrival.gate,
  };
}

module.exports = {
  getFlightEta
};
