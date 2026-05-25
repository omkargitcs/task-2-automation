require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const routeRoutes = require("./routes/routeRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount Modular API Route Routes
app.use("/api/auth", authRoutes);
app.use("/api/routes", routeRoutes);

// Establish DB connection before initializing server listener
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `[SERVER RUNNING] CivicRoute Core active on http://127.0.0.1:${PORT}`,
    );
  });
});
