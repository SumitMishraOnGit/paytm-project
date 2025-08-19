const express = require('express');
const cors = require('cors');
const rootRouter = require("./routes/index");
const mongoose = require('mongoose');
require('dotenv').config();

const app = express(); 
const PORT = 5000;

app.use(cors())
app.use(express.json());
app.use('/api/v1', rootRouter)

mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('Connected to MongoDB successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
// Start server
app.listen(PORT, () => { // Fixed: 'port' to 'PORT'
  console.log(`Server running at http://localhost:${PORT}`);
});
