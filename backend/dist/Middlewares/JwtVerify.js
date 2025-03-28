"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    try {
        if (!token) {
            res.status(401).json({ message: "Access Token is missing", status: false });
        }
        else {
            // Decode the token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "secret");
            req.data = decoded;
            next(); // Proceed to the next middleware
        }
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({
                message: "Unauthorized! Access Token is expired",
                status: false,
            });
        }
        else if (error.name === "JsonWebTokenError") {
            console.log("JsonWebTokenError");
            res.status(401).json({
                message: "Unauthorized! Access Token is invalid",
                status: false,
            });
        }
        else {
            res.status(401).json({
                message: "Unauthorized! Token verification failed",
                status: false,
            });
        }
    }
};
exports.default = verifyToken;
