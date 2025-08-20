const express = require('express');
const cors = require('cors');
const rootRouter = require("./routes/index");
const mongoose = require("mongoose")
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "https://thepaymentapp.vercel.app", // frontend domain
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use('/api/v1', rootRouter);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log(" MongoDB connected");
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error(" MongoDB connection error:", err);
});
