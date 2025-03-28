"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logger = winston_1.default.createLogger({
    level: "info", // Logs 'info' and above (info, warn, error)
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Timestamp for file
    winston_1.default.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })),
    transports: [
        new winston_1.default.transports.Console({ format: winston_1.default.format.colorize() }), // Console output
        new winston_1.default.transports.File({
            filename: path_1.default.join(__dirname, "..", "Logs", "app.log"), // Points to src/Logs/
            maxsize: 5242880, // 5MB max size (optional, rotates when full)
            maxFiles: 5, // Keep up to 5 rotated files (optional)
        }),
    ],
});
exports.default = logger;
