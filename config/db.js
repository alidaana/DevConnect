const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDb = async () => {
  try {
    await mongoose.connect(db, { useNewUrlParser: true });
    console.log("Connected to MongoDb...");
  } catch (err) {
    console.error(err.message);
    // exit the process if it fails to connect
    process.exit(1);
  }
};

module.exports = connectDb;
