const express = require("express");
const connectDb = require("./config/db");
const connectDB = require("./config/db");

const app = express();

// Connect to the DB
connectDb();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("API Running");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
