const dotenv = require('dotenv');
dotenv.config();

const { getFlightEta } = require('./services/flightService');

(async () => {
  try {
    const data = await getFlightEta('LY1');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('ERROR:', err.message);
  }
})();
