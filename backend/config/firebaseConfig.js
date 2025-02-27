const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-48be9-default-rtdb.firebaseio.com/", // Replace with your actual Firebase database URL
});

module.exports = admin;
