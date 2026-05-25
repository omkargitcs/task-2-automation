const express = require("express");
const router = express.Router();
const routeController = require("../controllers/routeController");
const authenticateToken = require("../middleware/auth");

// Public route
router.get("/", routeController.getAllRoutes);

// Protected routes
router.post("/", authenticateToken, routeController.createRoute);

// 🔍 CRITICAL: Must be EXACTLY "/:id" relative to the "/api/routes" mount
router.delete("/:id", authenticateToken, routeController.deleteRoute);

module.exports = router;
