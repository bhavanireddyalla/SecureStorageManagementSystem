const activityLogModel = require("../models/activityLogModel");

exports.getLogs = async (req, res) => {

    try {

        const logs = await activityLogModel.getLogs();

        res.json(logs);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch logs."
        });

    }

};