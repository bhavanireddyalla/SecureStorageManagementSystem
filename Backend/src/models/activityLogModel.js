const { sql } = require("../config/database");

const createLog = async ({
    userId,
    action,
    fileId,
    folderId,
    description
}) => {

    const request = new sql.Request();

    request.input("UserId", sql.Int, userId);
    request.input("Action", sql.VarChar, action);
    request.input("FileId", sql.Int, fileId || null);
    request.input("FolderId", sql.Int, folderId || null);
    request.input("Description", sql.VarChar, description);

    await request.query(`
        INSERT INTO ActivityLogs
        (
            UserId,
            Action,
            FileId,
            FolderId,
            Description
        )
        VALUES
        (
            @UserId,
            @Action,
            @FileId,
            @FolderId,
            @Description
        )
    `);
};

const getLogs = async () => {

    const result = await new sql.Request().query(`
        SELECT *
        FROM ActivityLogs
        ORDER BY CreatedAt DESC
    `);

    return result.recordset;
};

module.exports = {
    createLog,
    getLogs
};