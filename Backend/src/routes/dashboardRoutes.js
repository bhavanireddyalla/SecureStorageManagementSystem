const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const dashboardController = require("../controllers/dashboardController");

router.get(
    "/",
    authenticate,
    dashboardController.getDashboard
);

module.exports = router;