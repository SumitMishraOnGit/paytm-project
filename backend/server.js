const express = require('express');
const cors = require('cors');
const rootRouter = require("./routes/index");

const app = express;
const PORT = 5000;

app.use(cors())
app.use(express.json());
app.use('/api/v1', rootRouter)

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
