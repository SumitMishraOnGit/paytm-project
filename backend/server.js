const express = require('express');
const cors = require('cors');
const rootRouter = require("./routes/index");

const app = express(); 
const PORT = 5000;


app.use(cors({
  origin: "https://thepaymentapp.vercel.app", 
  methods: ["GET", "POST", "PUT", "DELETE"], 
  allowedHeaders: ["Content-Type", "Authorization"] 
}));

app.use(express.json());
app.use('/api/v1', rootRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
