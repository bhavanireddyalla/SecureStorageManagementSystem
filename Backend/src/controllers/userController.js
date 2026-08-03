const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.getAllUsers = async (req, res) => {
    try {

        const users = await userModel.getAllUsers();

        return res.status(200).json(users);

    } catch (error) {

        console.error("Get All Users Error:", error);

        return res.status(500).json({
            message: "Failed to fetch users."
        });

    }
};

exports.getUserById = async (req, res) => {
    try {

        const { id } = req.params;

        const user = await userModel.findUserById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        return res.status(200).json(user);

    } catch (error) {

        console.error("Get User Error:", error);

        return res.status(500).json({
            message: "Failed to fetch user."
        });

    }
};
exports.createUser = async (req, res) => {
    try {

        const { name, email, password, role } = req.body;

        // Validate input
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        // Check if email already exists
        const existingUser = await userModel.findUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists."
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        const normalizedRole = role.toLowerCase().trim();

        // Create user
        const user = await userModel.createUser({
            name,
            email,
            passwordHash,
            role: normalizedRole
        });

        // Remove password hash before sending response
        delete user.PasswordHash;

        return res.status(201).json({
            message: "User created successfully.",
            user
        });

    } catch (error) {

        console.error("Create User Error:", error);

        return res.status(500).json({
            message: "Failed to create user."
        });

    }
};

exports.updateUser = async (req, res) => {
    try {

        const { id } = req.params;
        const { name, email, role } = req.body;

        const existingUser = await userModel.findUserById(id);

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const normalizedRole = role.toLowerCase().trim();
        const updatedUser = await userModel.updateUser(id, {
            name,
            email,
            role: normalizedRole
        });

        return res.status(200).json({
            message: "User updated successfully.",
            user: updatedUser
        });

    } catch (error) {

        console.error("Update User Error:", error);

        return res.status(500).json({
            message: "Failed to update user."
        });

    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const existingUser = await userModel.findUserById(id);

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found."
            });
        }
        if (req.user.userId === parseInt(id)) {
            return res.status(400).json({
                message: "You cannot delete your own account."
            });
        }


        const deletedUser = await userModel.deleteUser(id);

        return res.status(200).json({
            message: "User deleted successfully.",
            user: deletedUser
        });

    } catch (error) {
        console.error("Delete User Error:", error);

        return res.status(500).json({
            message: "Failed to delete user."
        });
    }
};