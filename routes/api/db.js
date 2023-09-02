require("dotenv").config(); // Wczytaj zmienne środowiskowe z pliku .env

const mongoose = require("mongoose");


const dbUrl = process.env.DB_HOST;

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("connected", () => {
  console.log("Database connection successful");
});

db.on("error", (err) => {
  console.error("Database connection error:", err);
  process.exit(1);
});

module.exports = db;
