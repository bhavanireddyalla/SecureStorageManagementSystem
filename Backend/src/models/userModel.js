const { sql } = require('../config/database');

const createUser = async ({ name, email, passwordHash, role }) => {
    const request = new sql.Request();

    request.input("Name", sql.NVarChar, name);
    request.input("Email", sql.NVarChar, email);
    request.input("PasswordHash", sql.NVarChar, passwordHash);
    request.input("Role", sql.NVarChar, role);

    const result = await request.query(`
        INSERT INTO Users (Name, Email, PasswordHash, Role)
        OUTPUT INSERTED.*
        VALUES (@Name, @Email, @PasswordHash, @Role)
    `);

    return result.recordset[0];
};

const findUserByEmail = async (email) => {
    const request = new sql.Request();

    request.input("Email", sql.NVarChar, email);

    const result = await request.query(`
        SELECT * FROM Users
        WHERE Email = @Email
    `);

    return result.recordset[0];
};

const findUserById = async (userId) => {
    const request = new sql.Request();

    request.input("UserId", sql.Int, userId);

    const result = await request.query(`
        SELECT UserId, Name, Email, Role, CreatedAt
        FROM Users
        WHERE UserId = @UserId
    `);

    return result.recordset[0];
};

const getAllUsers = async () => {
    const result = await new sql.Request().query(`
        SELECT UserId, Name, Email, Role, CreatedAt
        FROM Users
        ORDER BY CreatedAt DESC
    `);

    return result.recordset;
};

// ADD THIS FUNCTION
const updateUser = async (userId, { name, email, role }) => {
    const request = new sql.Request();

    request.input("UserId", sql.Int, userId);
    request.input("Name", sql.NVarChar, name);
    request.input("Email", sql.NVarChar, email);
    request.input("Role", sql.NVarChar, role);

    const result = await request.query(`
        UPDATE Users
        SET
            Name = @Name,
            Email = @Email,
            Role = @Role
        OUTPUT
            INSERTED.UserId,
            INSERTED.Name,
            INSERTED.Email,
            INSERTED.Role,
            INSERTED.CreatedAt
        WHERE UserId = @UserId
    `);

    return result.recordset[0];
};
const deleteUser = async (userId) => {
    const request = new sql.Request();

    request.input("UserId", sql.Int, userId);

    const result = await request.query(`
        DELETE FROM Users
        OUTPUT
            DELETED.UserId,
            DELETED.Name,
            DELETED.Email,
            DELETED.Role,
            DELETED.CreatedAt
        WHERE UserId = @UserId
    `);

    return result.recordset[0];
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    getAllUsers,
    updateUser,
    deleteUser
    
};
