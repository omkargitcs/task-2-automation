// 1. Load environment configurations immediately at the very top entry breakpoint
require("dotenv").config();

// 2. Load external framework middleware packages
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

// 3. Load modular app routers
const authRoutes = require("./routes/authRoutes");
const routeRoutes = require("./routes/routeRoutes");

const app = express();

// Set the port fallback for Render environment synchronization
const PORT = process.env.PORT || 5000;

// Setup global request parsers
app.use(cors());
app.use(express.json());

// Mount Modular API Routes
app.use("/api/auth", authRoutes);
app.use("/api/routes", routeRoutes);

// 🔍 ADD THIS: Add a simple health check route so Render knows the server is alive
app.get("/", (req, res) => {
  res.status(200).send("CivicRoute Engine Is Live and Running!");
});

// Establish DB connection securely before starting the server listener
const startServer = async () => {
  try {
    console.log("[SERVER STARTUP] Connecting to MongoDB Atlas cluster...");
    await connectDB();
    console.log(
      "[SERVER STARTUP] Database connection established successfully.",
    );

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[SERVER RUNNING] CivicRoute Core active on port ${PORT}`);
    });
  } catch (error) {
    console.error("[SERVER FATAL ERROR] Initialization failed:", error);
    process.exit(1); // Safely exit if database connection drops
  }
};

startServer();
