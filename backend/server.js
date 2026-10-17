const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const expenseRoutes = require('./routes/expenseRoutes');
const app = express();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);


mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB.......!!!!!!!!');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

app.use(cors());
app.use(express.json());
app.use('/api/expenses', expenseRoutes);


app.get('/', (req, res) => {
  res.send('Hello World!.......');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});