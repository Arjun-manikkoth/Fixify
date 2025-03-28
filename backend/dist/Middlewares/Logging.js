"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = __importDefault(require("../Utils/Logger"));
const loggingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    // Capture request details
    const { method, url, body } = req;
    const requestInfo = `Request: ${method} ${url}${body ? ` | Body: ${JSON.stringify(body)}` : ""}`;
    // Log when response finishes
    res.on("finish", () => {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const responseInfo = `Response: ${res.statusCode} | Duration: ${duration}ms`;
        // Log based on status code
        if (statusCode >= 500) {
            Logger_1.default.error(`${requestInfo} | ${responseInfo}`); // Server errors (500-599)
        }
        else if (statusCode >= 400) {
            Logger_1.default.warn(`${requestInfo} | ${responseInfo}`); // Client errors (400-499)
        }
        else {
            Logger_1.default.info(`${requestInfo} | ${responseInfo}`); // Success (200-399)
        }
    });
    next();
};
exports.default = loggingMiddleware;
