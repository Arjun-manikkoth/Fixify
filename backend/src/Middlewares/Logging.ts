// server/loggingMiddleware.ts
import { Request, Response, NextFunction } from "express";
import logger from "../Utils/Logger";

const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Capture request details
    const { method, url, body } = req;
    const requestInfo = `Request: ${method} ${url}${
        body ? ` | Body: ${JSON.stringify(body)}` : ""
    }`;

    // Log when response finishes
    res.on("finish", () => {
        const duration = Date.now() - startTime;

        const statusCode = res.statusCode;

        const responseInfo = `Response: ${res.statusCode} | Duration: ${duration}ms`;

        // Log based on status code
        if (statusCode >= 500) {
            logger.error(`${requestInfo} | ${responseInfo}`); // Server errors (500-599)
        } else if (statusCode >= 400) {
            logger.warn(`${requestInfo} | ${responseInfo}`); // Client errors (400-499)
        } else {
            logger.info(`${requestInfo} | ${responseInfo}`); // Success (200-399)
        }
    });

    next();
};

export default loggingMiddleware;
