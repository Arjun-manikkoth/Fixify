import winston from "winston";
import path from "path";

const logger = winston.createLogger({
    level: "info", // Logs 'info' and above (info, warn, error)
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Timestamp for file
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console({ format: winston.format.colorize() }), // Console output
        new winston.transports.File({
            filename: path.join(__dirname, "..", "Logs", "app.log"), // Points to src/Logs/
            maxsize: 5242880, // 5MB max size (optional, rotates when full)
            maxFiles: 5, // Keep up to 5 rotated files (optional)
        }),
    ],
});

export default logger;
