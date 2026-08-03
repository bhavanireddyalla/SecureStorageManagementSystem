const fileModel = require("../models/fileModel");
const folderModel = require("../models/folderModel");
// const fs = require("fs");
// const path = require("path");
const { v4: uuidv4 } = require("uuid");
const s3Service = require("../services/s3Service");
const activityLogModel = require("../models/activityLogModel");
const fileVersionModel = require("../models/fileVersionModel");


exports.uploadFile = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded."
            });
        }

        const { folderId } = req.body;

        if (!folderId) {
            return res.status(400).json({
                message: "Folder ID is required."
            });
        }

        // Generate unique S3 file name
        const storedName = uuidv4() + "-" + req.file.originalname;

        // Upload to S3
        await s3Service.uploadFile(req.file, storedName);

        // Save metadata in SQL Server
        const file = await fileModel.createFile({
            folderId,
            originalName: req.file.originalname,
            storedName,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            storageKey: storedName,
            uploadedBy: req.user.userId
        });
        await activityLogModel.createLog({
    userId: req.user.userId,
    action: "UPLOAD",
    fileId: file.FileId,
    folderId: file.FolderId,
    description: `Uploaded file ${file.OriginalName}`
});

        return res.status(201).json({
            message: "File uploaded successfully.",
            file
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Upload failed."
        });

    }

};

exports.getAllFiles = async (req, res) => {
    try {
        const { sort, folderId } = req.query;

        const files = await fileModel.getAllFiles(sort, folderId ? parseInt(folderId, 10) : null);

        return res.json(files);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch files."
        });

    }
};

exports.getFileById = async (req, res) => {
    try {

        const file = await fileModel.getFileById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "File not found."
            });
        }

        return res.json(file);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch file."
        });

    }
};
exports.updateFile = async (req, res) => {

    try {

        const { originalName } = req.body;

        const file = await fileModel.getFileById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "File not found."
            });
        }

        const updatedFile = await fileModel.updateFile(
            req.params.id,
            originalName
        );
        await activityLogModel.createLog({
    userId: req.user.userId,
    action: "RENAME",
    fileId: updatedFile.FileId,
    folderId: updatedFile.FolderId,
    description: `Renamed file to ${updatedFile.OriginalName}`
});

        return res.json({
            message: "File renamed successfully.",
            file: updatedFile
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to rename file."
        });

    }

};
exports.moveFile = async (req, res) => {

    try {

        const rawFolderId = req.body.folderId;
        const folderId = rawFolderId === null || rawFolderId === undefined || rawFolderId === ""
            ? null
            : parseInt(rawFolderId, 10);

        if (rawFolderId !== null && rawFolderId !== undefined && rawFolderId !== "" && Number.isNaN(folderId)) {
            return res.status(400).json({
                message: "Invalid folder ID."
            });
        }

        const file = await fileModel.getFileById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "File not found."
            });
        }

        let folder = null;
        if (folderId !== null) {
            folder = await folderModel.getFolderById(folderId);

            if (!folder) {
                return res.status(404).json({
                    message: "Destination folder not found."
                });
            }
        }

        const updatedFile = await fileModel.moveFile(
            req.params.id,
            folderId
        );
        await activityLogModel.createLog({
    userId: req.user.userId,
    action: "MOVE",
    fileId: updatedFile.FileId,
    folderId: updatedFile.FolderId,
    description: `Moved file to folder ${updatedFile.FolderId}`
});

        return res.json({
            message: "File moved successfully.",
            file: updatedFile
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to move file."
        });

    }

};
exports.deleteFile = async (req, res) => {
    try {

        const file = await fileModel.getFileById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "File not found."
            });
        }

        // Log the activity
        await activityLogModel.createLog({
            userId: req.user.userId,
            action: "DELETE",
            fileId: file.FileId,
            folderId: file.FolderId,
            description: `Deleted file ${file.OriginalName}`
        });

        // Delete the file from S3
        await s3Service.deleteFile(file.StorageKey);

        // Delete the file metadata from SQL Server
        await fileModel.deleteFile(req.params.id);

        return res.json({
            message: "File deleted successfully."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to delete file."
        });

    }
};
exports.downloadFile = async (req, res) => {
    try {

        const file = await fileModel.getFileById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "File not found."
            });
        }

        await activityLogModel.createLog({
            userId: req.user.userId,
            action: "DOWNLOAD",
            fileId: file.FileId,
            folderId: file.FolderId,
            description: `Downloaded file ${file.OriginalName}`
        });

        const stream = await s3Service.downloadFile(file.StorageKey);

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${file.OriginalName}"`
        );

        res.setHeader(
            "Content-Type",
            file.FileType
        );

        stream.pipe(res);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Download failed."
        });

    }
};
exports.previewFile = async (req, res) => {
    try {

        const file = await fileModel.getFileById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "File not found."
            });
        }

        const s3File = await s3Service.getFile(file.StorageKey);

        res.setHeader("Content-Type", file.FileType);

        res.setHeader(
            "Content-Disposition",
            `inline; filename="${file.OriginalName}"`
        );

        s3File.Body.pipe(res);

    } catch (error) {
        console.error("Preview Error:", error);
        await activityLogModel.createLog({
    userId: req.user.userId,
    action: "PREVIEW",
    fileId: file.FileId,
    folderId: file.FolderId,
    description: `Previewed file ${file.OriginalName}`
});

        return res.status(500).json({
            message: "Preview failed."
        });
    }
};
exports.searchFiles = async (req, res) => {

    try {

        const { name } = req.query;

        const files = await fileModel.searchFiles(name || "");

        return res.json(files);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Search failed."
        });

    }

};
exports.getPresignedUrl = async (req, res) => {

    try {

        const file = await fileModel.getFileById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "File not found."
            });
        }

        const url = await s3Service.generatePresignedUrl(
            file.StorageKey
        );

        return res.json({
            message: "Pre-signed URL generated successfully.",
            url
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to generate URL."
        });

    }

};
exports.getFileVersions = async (req, res) => {

    try {

        const versions = await fileVersionModel.getVersions(req.params.id);

        return res.json(versions);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch versions."
        });

    }

};
exports.uploadNewVersion = async (req, res) => {

    try {

        const file = await fileModel.getFileById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "File not found."
            });
        }

        // Save current version
        const versions = await fileVersionModel.getVersions(file.FileId);

        await fileVersionModel.createVersion({
            fileId: file.FileId,
            versionNumber: versions.length + 1,
            storedName: file.StoredName,
            storageKey: file.StorageKey,
            fileSize: file.FileSize,
            fileType: file.FileType,
            uploadedBy: req.user.userId
        });

        // Upload new file
        const storedName = uuidv4() + "-" + req.file.originalname;

        await s3Service.uploadFile(req.file, storedName);

        // Delete old file from S3
        await s3Service.deleteFile(file.StorageKey);

        // Update metadata
        const updated = await fileModel.replaceFile(
            file.FileId,
            req.file.originalname,
            storedName,
            storedName,
            req.file.mimetype,
            req.file.size
        );

        await activityLogModel.createLog({
            userId: req.user.userId,
            action: "NEW_VERSION",
            fileId: file.FileId,
            folderId: file.FolderId,
            description: `Uploaded new version of ${file.OriginalName}`
        });

        return res.json({
            message: "New version uploaded successfully.",
            file: updated
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Version upload failed."
        });

    }

};
