const express = require('express');
const cors = require('cors');
const rootRouter = require("./routes/index");

const app = express(); // 🟢 FIX: you had `const app = express;` (forgot parentheses)
const PORT = 5000;

// 🟢 FIX: configure cors properly so frontend (vercel) can call backend (render)
app.use(cors({
  origin: "https://thepaymentapp.vercel.app", // allow your deployed frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // allowed methods
  allowedHeaders: ["Content-Type", "Authorization"] // allow token header
}));

app.use(express.json());
app.use('/api/v1', rootRouter);

// 🟢 FIX: you wrote `port` but variable is `PORT`
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
