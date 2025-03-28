"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        var _a;
        const role = (_a = req.data) === null || _a === void 0 ? void 0 : _a.role; // Get role from the request object (set by verifyToken)
        if (!allowedRoles.includes(role)) {
            res.status(403).json({
                message: "Forbidden! Insufficient permissions",
                status: false,
            });
        }
        else {
            next(); // Proceed to the next middleware
        }
    };
};
exports.default = verifyRole;
