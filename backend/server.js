const express = require('express');
const cors = require('cors');
const rootRouter = require("./routes/index");
const mongoose = require("mongoose")
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;

// More flexible CORS configuration
app.use(cors({
  origin: [
    "https://thepaymentapp.vercel.app", // production
    "http://localhost:3000", // local development
    "http://localhost:5173", // vite dev server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use('/api/v1', rootRouter);

// Add a simple health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

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
