const folderModel = require("../models/folderModel");

exports.createFolder = async (req, res) => {
    try {

        const { folderName, parentFolderId } = req.body;

        if (!folderName) {
            return res.status(400).json({
                message: "Folder name is required."
            });
        }

        // ✅ Check if parent folder exists (for nested folders)
        if (parentFolderId) {

            const parent = await folderModel.getFolderById(parentFolderId);

            if (!parent) {
                return res.status(404).json({
                    message: "Parent folder not found."
                });
            }
        }

        // ✅ Check duplicate folder name under the same parent
        const existingFolder = await folderModel.findFolderByName(
            folderName,
            parentFolderId
        );

        if (existingFolder) {
            return res.status(409).json({
                message: "A folder with this name already exists."
            });
        }

        const folder = await folderModel.createFolder({
            folderName,
            parentFolderId,
            createdBy: req.user.userId
        });

        return res.status(201).json({
            message: "Folder created successfully.",
            folder
        });

    } catch (error) {

        console.error("Create Folder Error:", error);

        return res.status(500).json({
            message: "Failed to create folder."
        });

    }
};
exports.getAllFolders = async (req, res) => {
    try {

        const { sort } = req.query;

const folders = await folderModel.getAllFolders(sort);

        return res.status(200).json(folders);

    } catch (error) {

        console.error("Get All Folders Error:", error);

        return res.status(500).json({
            message: "Failed to fetch folders."
        });

    }
};

exports.getFolderById = async (req, res) => {
    try {

        const { id } = req.params;

        const folder = await folderModel.getFolderById(id);

        if (!folder) {
            return res.status(404).json({
                message: "Folder not found."
            });
        }

        return res.status(200).json(folder);

    } catch (error) {

        console.error("Get Folder Error:", error);

        return res.status(500).json({
            message: "Failed to fetch folder."
        });

    }
};

exports.updateFolder = async (req, res) => {
    try {

        const { id } = req.params;
        const { folderName } = req.body;

        if (!folderName) {
            return res.status(400).json({
                message: "Folder name is required."
            });
        }

        const existingFolder = await folderModel.getFolderById(id);

        if (!existingFolder) {
            return res.status(404).json({
                message: "Folder not found."
            });
        }

        const updatedFolder = await folderModel.updateFolder(id, folderName);

        return res.status(200).json({
            message: "Folder renamed successfully.",
            folder: updatedFolder
        });

    } catch (error) {

        console.error("Update Folder Error:", error);

        return res.status(500).json({
            message: "Failed to update folder."
        });

    }
};

exports.deleteFolder = async (req, res) => {
    try {

        const { id } = req.params;

        const existingFolder = await folderModel.getFolderById(id);

        if (!existingFolder) {
            return res.status(404).json({
                message: "Folder not found."
            });
        }

        // Prevent deleting folders that have child folders
        const hasChildren = await folderModel.hasChildFolders(id);

        if (hasChildren) {
            return res.status(400).json({
                message: "Cannot delete a folder that contains subfolders."
            });
        }

        const hasFiles = await folderModel.hasFiles(id);

        if (hasFiles) {
            return res.status(400).json({
                message: "Cannot delete a folder that contains files. Move or delete the files first."
            });
        }

        const deletedFolder = await folderModel.deleteFolder(id);

        return res.status(200).json({
            message: "Folder deleted successfully.",
            folder: deletedFolder
        });

    } catch (error) {

        console.error("Delete Folder Error:", error);

        return res.status(500).json({
            message: "Failed to delete folder."
        });

    }
};
exports.searchFolders = async (req, res) => {

    try {

        const { name } = req.query;

        const folders = await folderModel.searchFolders(name || "");

        return res.json(folders);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Search failed."
        });

    }

};
exports.getFolderTree = async (req, res) => {

    try {

        const folders = await folderModel.getFolderTree();

        const buildTree = (parentId = null) => {
            return folders
                .filter(folder => folder.ParentFolderId === parentId)
                .map(folder => ({
                    ...folder,
                    children: buildTree(folder.FolderId)
                }));
        };

        return res.json(buildTree());

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch folder tree."
        });

    }

};
exports.moveFolder = async (req, res) => {

    try {

        const { parentFolderId } = req.body;

        const folder = await folderModel.getFolderById(req.params.id);

        if (!folder) {
            return res.status(404).json({
                message: "Folder not found."
            });
        }

        // Prevent moving a folder into itself
        if (Number(req.params.id) === Number(parentFolderId)) {
            return res.status(400).json({
                message: "A folder cannot be moved into itself."
            });
        }

        // Prevent moving a folder into one of its descendants
        if (parentFolderId !== null && parentFolderId !== undefined) {
            const movingIntoDescendant = await folderModel.isDescendantFolder(
                req.params.id,
                parentFolderId
            );

            if (movingIntoDescendant) {
                return res.status(400).json({
                    message: "A folder cannot be moved into one of its subfolders."
                });
            }
        }

        if (parentFolderId !== null) {

            const parent = await folderModel.getFolderById(parentFolderId);

            if (!parent) {
                return res.status(404).json({
                    message: "Destination folder not found."
                });
            }

        }

        const updatedFolder = await folderModel.moveFolder(
            req.params.id,
            parentFolderId
        );

        return res.json({
            message: "Folder moved successfully.",
            folder: updatedFolder
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to move folder."
        });

    }

};