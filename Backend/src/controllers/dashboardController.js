const userModel = require("../models/userModel");
const folderModel = require("../models/folderModel");
const fileModel = require("../models/fileModel");

exports.getDashboard = async (req, res) => {

    try {

        const users = await userModel.getAllUsers();
        const folders = await folderModel.getAllFolders();
        const files = await fileModel.getAllFiles();

        const recentFiles = files
            .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))
            .slice(0, 5);

        return res.json({

            totalUsers: users.length,

            totalFolders: folders.length,

            totalFiles: files.length,

            recentFiles

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Dashboard loading failed."
        });

    }

};