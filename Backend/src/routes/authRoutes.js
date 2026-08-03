const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Public login
router.post("/login", authController.login);

// Account creation is Admin-only (same as /api/users).
// Prefer POST /api/users from the User Management screen.
router.post("/register", authenticate, authorize("Admin"), authController.register);

module.exports = router;
