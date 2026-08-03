const { sql } = require("../config/database");

const createFolder = async ({ folderName, parentFolderId, createdBy }) => {
    const request = new sql.Request();

    request.input("FolderName", sql.NVarChar, folderName);
    request.input("ParentFolderId", sql.Int, parentFolderId || null);
    request.input("CreatedBy", sql.Int, createdBy);

    const result = await request.query(`
        INSERT INTO Folders (FolderName, ParentFolderId, CreatedBy)
        OUTPUT INSERTED.*
        VALUES (@FolderName, @ParentFolderId, @CreatedBy)
    `);

    return result.recordset[0];
};
const getAllFolders = async (sort = "name") => {

    let orderBy = "FolderName ASC";

    switch (sort) {
        case "date":
            orderBy = "CreatedAt DESC";
            break;

        case "name":
        default:
            orderBy = "FolderName ASC";
            break;
    }

    const result = await new sql.Request().query(`
        SELECT *
        FROM Folders
        ORDER BY ${orderBy}
    `);

    return result.recordset;
};
const getFolderById = async (folderId) => {
    const request = new sql.Request();

    request.input("FolderId", sql.Int, folderId);

    const result = await request.query(`
        SELECT
            FolderId,
            FolderName,
            ParentFolderId,
            CreatedBy,
            CreatedAt
        FROM Folders
        WHERE FolderId = @FolderId
    `);

    return result.recordset[0];
};
const updateFolder = async (folderId, folderName) => {
    const request = new sql.Request();

    request.input("FolderId", sql.Int, folderId);
    request.input("FolderName", sql.NVarChar, folderName);

    const result = await request.query(`
        UPDATE Folders
        SET FolderName = @FolderName
        OUTPUT
            INSERTED.FolderId,
            INSERTED.FolderName,
            INSERTED.ParentFolderId,
            INSERTED.CreatedBy,
            INSERTED.CreatedAt
        WHERE FolderId = @FolderId
    `);

    return result.recordset[0];
};
const deleteFolder = async (folderId) => {
    const request = new sql.Request();

    request.input("FolderId", sql.Int, folderId);

    const result = await request.query(`
        DELETE FROM Folders
        OUTPUT
            DELETED.FolderId,
            DELETED.FolderName,
            DELETED.ParentFolderId,
            DELETED.CreatedBy,
            DELETED.CreatedAt
        WHERE FolderId = @FolderId
    `);

    return result.recordset[0];
};
const findFolderByName = async (folderName, parentFolderId) => {
    const request = new sql.Request();

    request.input("FolderName", sql.NVarChar, folderName);
    request.input("ParentFolderId", sql.Int, parentFolderId ?? null);

    const result = await request.query(`
        SELECT *
        FROM Folders
        WHERE FolderName = @FolderName
        AND (
            (ParentFolderId = @ParentFolderId)
            OR
            (ParentFolderId IS NULL AND @ParentFolderId IS NULL)
        )
    `);

    return result.recordset[0];
};
const hasChildFolders = async (folderId) => {

    const request = new sql.Request();

    request.input("FolderId", sql.Int, folderId);

    const result = await request.query(`
        SELECT COUNT(*) AS Total
        FROM Folders
        WHERE ParentFolderId = @FolderId
    `);

    return result.recordset[0].Total > 0;
};

const hasFiles = async (folderId) => {
    const request = new sql.Request();

    request.input("FolderId", sql.Int, folderId);

    const result = await request.query(`
        SELECT COUNT(*) AS Total
        FROM Files
        WHERE FolderId = @FolderId
    `);

    return result.recordset[0].Total > 0;
};

const isDescendantFolder = async (folderId, possibleAncestorId) => {
    if (possibleAncestorId === null || possibleAncestorId === undefined) {
        return false;
    }

    let currentId = Number(possibleAncestorId);
    const targetId = Number(folderId);
    const visited = new Set();

    while (currentId && !visited.has(currentId)) {
        if (currentId === targetId) {
            return true;
        }

        visited.add(currentId);
        const folder = await getFolderById(currentId);
        currentId = folder?.ParentFolderId ? Number(folder.ParentFolderId) : null;
    }

    return false;
};
const searchFolders = async (search) => {

    const request = new sql.Request();

    request.input("Search", sql.NVarChar, `%${search}%`);

    const result = await request.query(`
        SELECT *
        FROM Folders
        WHERE FolderName LIKE @Search
        ORDER BY CreatedAt DESC
    `);

    return result.recordset;
};
const getFolderTree = async () => {

    const result = await new sql.Request().query(`
        SELECT *
        FROM Folders
        ORDER BY FolderName
    `);

    return result.recordset;
};
const moveFolder = async (folderId, parentFolderId) => {

    const request = new sql.Request();

    request.input("FolderId", sql.Int, folderId);
    request.input("ParentFolderId", sql.Int, parentFolderId);

    const result = await request.query(`
        UPDATE Folders
        SET ParentFolderId = @ParentFolderId
        OUTPUT INSERTED.*
        WHERE FolderId = @FolderId
    `);

    return result.recordset[0];
};
module.exports = {
    createFolder,
    getAllFolders,
    getFolderById,
    updateFolder,
    deleteFolder,
    findFolderByName,
    hasChildFolders,
    hasFiles,
    isDescendantFolder,
    searchFolders,
    getFolderTree,
    moveFolder
};