const express = require("express");
const router = express.Router();

const folderController = require("../controllers/folderController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
router.get(
    "/search",
    authenticate,
    folderController.searchFolders
);
router.get(
    "/tree",
    authenticate,
    folderController.getFolderTree
);
router.put(
    "/:id/move",
    authenticate,
    authorize("Admin"),
    folderController.moveFolder
);
// Admin
router.post("/", authenticate, authorize("Admin"), folderController.createFolder);
router.put("/:id", authenticate, authorize("Admin"), folderController.updateFolder);
router.delete("/:id", authenticate, authorize("Admin"), folderController.deleteFolder);

// Admin & Viewer
router.get("/", authenticate, folderController.getAllFolders);
router.get("/:id", authenticate, folderController.getFolderById);

module.exports = router;