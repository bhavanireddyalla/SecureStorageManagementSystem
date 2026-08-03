const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const { generateToken } = require("../utils/jwt");

const register = async ({ name, email, password, role }) => {
    if (!name || !email || !password || !role) {
        throw new Error("All fields are required.");
    }

    const existingUser = await userModel.findUserByEmail(email);

    if (existingUser) {
        throw new Error("Email already exists.");
    }

    const normalizedRole = role.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userModel.createUser({
        name,
        email,
        passwordHash,
        role: normalizedRole
    });

    delete user.PasswordHash;

    return {
        message: "User registered successfully.",
        user
    };
};

const login = async ({ email, password }) => {
    if (!email || !password) {
        throw new Error("Email and password are required.");
    }

    const user = await userModel.findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const token = generateToken(user);

    return {
        token,
        user: {
            id: user.UserId,
            name: user.Name,
            email: user.Email,
            role: user.Role
        }
    };
};

module.exports = {
    register,
    login
};