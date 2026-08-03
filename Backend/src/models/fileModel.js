const { sql } = require("../config/database");

const createFile = async ({
    folderId,
    originalName,
    storedName,
    fileType,
    fileSize,
    storageKey,
    uploadedBy
}) => {

    const request = new sql.Request();

    request.input("FolderId", sql.Int, folderId);
    request.input("OriginalName", sql.VarChar, originalName);
    request.input("StoredName", sql.VarChar, storedName);
    request.input("FileType", sql.VarChar, fileType);
    request.input("FileSize", sql.BigInt, fileSize);
    request.input("StorageKey", sql.VarChar, storageKey);
    request.input("UploadedBy", sql.Int, uploadedBy);

    const result = await request.query(`
        INSERT INTO Files
        (
            FolderId,
            OriginalName,
            StoredName,
            FileType,
            FileSize,
            StorageKey,
            UploadedBy
        )
        OUTPUT INSERTED.*
        VALUES
        (
            @FolderId,
            @OriginalName,
            @StoredName,
            @FileType,
            @FileSize,
            @StorageKey,
            @UploadedBy
        )
    `);

    return result.recordset[0];
};
const getAllFiles = async (sort = "date", folderId = null) => {

    let orderBy = "CreatedAt DESC";

    switch (sort) {
        case "name":
            orderBy = "OriginalName ASC";
            break;

        case "size":
            orderBy = "FileSize DESC";
            break;

        case "date":
        default:
            orderBy = "CreatedAt DESC";
            break;
    }

    let query = `
        SELECT *
        FROM Files
    `;

    const request = new sql.Request();

    if (folderId) {
        query += "WHERE FolderId = @FolderId\n";
        request.input("FolderId", sql.Int, folderId);
    }

    query += `ORDER BY ${orderBy}`;

    const result = await request.query(query);

    return result.recordset;
};

const getFileById = async (fileId) => {
    const request = new sql.Request();

    request.input("FileId", sql.Int, fileId);

    const result = await request.query(`
        SELECT *
        FROM Files
        WHERE FileId = @FileId
    `);

    return result.recordset[0];
};
const updateFile = async (fileId, originalName) => {

    const request = new sql.Request();

    request.input("FileId", sql.Int, fileId);
    request.input("OriginalName", sql.VarChar, originalName);

    const result = await request.query(`
        UPDATE Files
        SET OriginalName = @OriginalName

        OUTPUT INSERTED.*

        WHERE FileId = @FileId
    `);

    return result.recordset[0];
};
const moveFile = async (fileId, folderId) => {

    const request = new sql.Request();

    request.input("FileId", sql.Int, fileId);
    request.input("FolderId", sql.Int, folderId);

    const result = await request.query(`
        UPDATE Files
        SET FolderId = @FolderId

        OUTPUT INSERTED.*

        WHERE FileId = @FileId
    `);

    return result.recordset[0];
};
const deleteFile = async (fileId) => {

    const request = new sql.Request();

    request.input("FileId", sql.Int, fileId);

    const result = await request.query(`
        DELETE FROM Files
        OUTPUT DELETED.*
        WHERE FileId = @FileId
    `);

    return result.recordset[0];
};
const searchFiles = async (search) => {

    const request = new sql.Request();

    request.input("Search", sql.VarChar, `%${search}%`);

    const result = await request.query(`
        SELECT *
        FROM Files
        WHERE OriginalName LIKE @Search
        ORDER BY CreatedAt DESC
    `);

    return result.recordset;
};
const replaceFile = async (
    fileId,
    originalName,
    storedName,
    storageKey,
    fileType,
    fileSize
) => {

    const request = new sql.Request();

    request.input("FileId", sql.Int, fileId);
    request.input("OriginalName", sql.VarChar, originalName);
    request.input("StoredName", sql.VarChar, storedName);
    request.input("StorageKey", sql.VarChar, storageKey);
    request.input("FileType", sql.VarChar, fileType);
    request.input("FileSize", sql.BigInt, fileSize);

    const result = await request.query(`
        UPDATE Files
        SET
            OriginalName=@OriginalName,
            StoredName=@StoredName,
            StorageKey=@StorageKey,
            FileType=@FileType,
            FileSize=@FileSize
        OUTPUT INSERTED.*
        WHERE FileId=@FileId
    `);

    return result.recordset[0];
};



module.exports = {
    createFile,
    getAllFiles,
    getFileById,
    updateFile,
    moveFile,
    deleteFile,
    searchFiles,
    replaceFile
   
};
