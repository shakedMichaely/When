const express = require('express');
const dotenv = require('dotenv');
const flightRoutes = require('./routes/flight');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/flights', flightRoutes);

app.get('/', (req, res) => {
  res.send('Flight Tracker API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
