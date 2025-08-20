const express = require('express');
const cors = require('cors');
const rootRouter = require("./routes/index");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "https://thepaymentapp.vercel.app", // frontend domain
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use('/api/v1', rootRouter);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log(" MongoDB connected");
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error(" MongoDB connection error:", err);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
