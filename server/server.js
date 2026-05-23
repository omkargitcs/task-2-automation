const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const connectionString =
  "postgresql://neondb_owner:npg_vThq2DRXr0fZ@ep-lucky-term-aqxtciqh-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
});

app.use(cors());
app.use(express.json());

const civicDatabase = {
  churchgate:
    "Churchgate station, opened in 1870, was named after the ancient stone gate that led into the old British St. Thomas Fort.",
  "marine drive":
    "Marine Drive's iconic promenade was constructed in the 1920s on soil reclaimed from the Arabian Sea.",
  bandra:
    "Bandra features the historic Castella de Aguada (Bandra Fort), a coastal watchtower built by the Portuguese in 1640.",
  csmt: "Chhatrapati Shivaji Maharaj Terminus is a UNESCO World Heritage site completed in 1888, showcasing Italian Gothic architecture.",
  "flora fountain":
    "Flora Fountain was erected in 1864 at the exact spot where the historic stone walls of the Bombay Fort were demolished.",
  "kala ghoda":
    "Kala Ghoda is an urban art district named after a historic black stone equestrian statue of King Edward VII that stood there until 1965.",
};

async function initializeDatabase() {
  const createTableQuery = `
  Create table IF NOT EXISTS routes(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  path TEXT NOT NULL,
  trivia TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `;
  try {
    await pool.query(createTableQuery);
    console.log("[DATABASE] 'routes' schema verified and ready.");
  } catch (err) {
    console.error("[DATABASE ERROR] Initialization failure:", err);
  }
}
initializeDatabase();

app.get("/api/routes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM routes ORDER BY created_at DESC",
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve routes from database" });
  }
});

app.post("/api/routes", async (req, res) => {
  const { name, milestones } = req.body;

  if (!name || !milestones) {
    return res
      .status(400)
      .json({ error: "Missing required fields : name or milestones" });
  }

  const locationArray = milestones
    .split(",")
    .map((item) => item.trim().toLowerCase());
  const extractedTrivia = [];

  locationArray.forEach((loc) => {
    if (civicDatabase[loc]) {
      extractedTrivia.push(civicDatabase[loc]);
    }
  });

  if (extractedTrivia.length === 0) {
    extractedTrivia.push(
      `Route registered successfully. No ancient historic landmarks mapped for these specific coordinates yet.`,
    );
  }

  const pathFormatted = milestones
    .split(",")
    .map((item) => item.trim())
    .join("->");
  const insertQuery = `
    INSERT INTO routes(name,path,trivia)
    VALUES($1,$2,$3)
    RETURNING *;
    `;

  try {
    const result = await pool.query(insertQuery, [
      name,
      pathFormatted,
      extractedTrivia,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "FAILED TO SAVE ROUTE TO DATABASE" });
  }
});

app.listen(PORT, () => {
  console.log(
    `[SERVER RUNNING] CivicRoute Core Engine active on http://localhost:${PORT}`,
  );
});
