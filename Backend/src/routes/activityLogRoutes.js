const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const activityLogController = require("../controllers/activityLogController");

router.get(
    "/",
    authenticate,
    authorize("Admin"),
    activityLogController.getLogs
);

module.exports = router;