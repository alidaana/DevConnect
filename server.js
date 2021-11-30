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

// Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
