const authorize = (...roles) => {

    return (req, res, next) => {
        const userRole = String(req.user?.role || "").toLowerCase();
        const allowedRoles = roles.map((role) => String(role).toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: "Access denied."
            });
        }

        next();
    };

};

module.exports = authorize;