const express = require('express');
const dotenv = require('dotenv');
const flightRoutes = require('./routes/flight');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static('public'));

app.use('/api/flights', flightRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
