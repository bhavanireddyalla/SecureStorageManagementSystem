const { sql } = require("../config/database");

const createVersion = async ({
    fileId,
    versionNumber,
    storedName,
    storageKey,
    fileSize,
    fileType,
    uploadedBy
}) => {

    const request = new sql.Request();

    request.input("FileId", sql.Int, fileId);
    request.input("VersionNumber", sql.Int, versionNumber);
    request.input("StoredName", sql.VarChar, storedName);
    request.input("StorageKey", sql.VarChar, storageKey);
    request.input("FileSize", sql.BigInt, fileSize);
    request.input("FileType", sql.VarChar, fileType);
    request.input("UploadedBy", sql.Int, uploadedBy);

    const result = await request.query(`
        INSERT INTO FileVersions
        (
            FileId,
            VersionNumber,
            StoredName,
            StorageKey,
            FileSize,
            FileType,
            UploadedBy
        )
        OUTPUT INSERTED.*
        VALUES
        (
            @FileId,
            @VersionNumber,
            @StoredName,
            @StorageKey,
            @FileSize,
            @FileType,
            @UploadedBy
        )
    `);

    return result.recordset[0];
};

const getVersions = async (fileId) => {

    const request = new sql.Request();

    request.input("FileId", sql.Int, fileId);

    const result = await request.query(`
        SELECT *
        FROM FileVersions
        WHERE FileId=@FileId
        ORDER BY VersionNumber DESC
    `);

    return result.recordset;
};

module.exports = {
    createVersion,
    getVersions
};