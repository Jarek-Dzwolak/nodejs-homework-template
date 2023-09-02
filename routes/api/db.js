const mongoose = require("mongoose");


const dbUrl = "mongodb+srv://jaroslawdzwolak:YkP9R73NbIQxZUqy@mynewclaster.flblrxp.mongodb.net/";


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
  process.exit(1); // Zakończ proces w przypadku błędu
});

module.exports = db;
