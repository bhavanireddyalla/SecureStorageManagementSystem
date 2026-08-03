const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const fileController = require("../controllers/fileController");
const upload = require("../config/multer");


// Admin
router.post(
    "/upload",
    authenticate,
    authorize("Admin"),
    upload.single("file"),
    fileController.uploadFile
);
router.put(
    "/:id/move",
    authenticate,
    authorize("Admin"),
    fileController.moveFile
);
router.get(
    "/search",
    authenticate,
    fileController.searchFiles
);
router.get(
    "/:id/presigned-url",
    authenticate,
    fileController.getPresignedUrl
);

router.put(
    "/:id",
    authenticate,
    authorize("Admin"),
    fileController.updateFile
);
router.delete(
    "/:id",
    authenticate,
    authorize("Admin"),
    fileController.deleteFile
);
router.get(
    "/:id/download",
    authenticate,
    fileController.downloadFile
);
router.get(
    "/:id/preview",
    authenticate,
    fileController.previewFile
);

router.get(
    "/:id/share",
    authenticate,
    fileController.getPresignedUrl
);
router.get(
    "/:id/versions",
    authenticate,
    fileController.getFileVersions
);
router.post(
    "/:id/version",
    authenticate,
    authorize("Admin"),
    upload.single("file"),
    fileController.uploadNewVersion
);

// Admin & Viewer
router.get("/", authenticate, fileController.getAllFiles);
router.get("/:id", authenticate, fileController.getFileById);

module.exports = router;