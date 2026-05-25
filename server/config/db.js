const { MongoClient } = require("mongodb");
require("dotenv").config();

const mongoURI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/civicroute";
const client = new MongoClient(mongoURI);

let db = null;

async function connectDB() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db();
    console.log("[DATABASE] Connected securely to MongoDB Atlas Cloud.");
    return db;
  } catch (err) {
    console.error("[DATABASE ERROR] Connection failure:", err.message);
    process.exit(1);
  }
}

const getCollection = (collectionName) => {
  if (!db) throw new Error("Database not initialized. Call connectDB first.");
  return db.collection(collectionName);
};

module.exports = { connectDB, getCollection };
