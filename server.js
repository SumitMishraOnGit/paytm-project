const express = require('express');
const cors = require('cors');
const rootRouter = require("./routes/index");

const app = express;
const PORT = 5000;

app.use(cors())
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use('/api/v1', rootRouter)

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
