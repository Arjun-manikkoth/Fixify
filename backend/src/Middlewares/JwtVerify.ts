import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            data?: JwtPayload; // Extend Request to include 'data'
        }
    }
}

// Middleware to verify JWT
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;

    try {
        if (!token) {
            res.status(401).json({ message: "Access Token is missing", status: false });
        } else {
            // Decode the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;
            req.data = decoded;

            next(); // Proceed to the next middleware
        }
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({
                message: "Unauthorized! Access Token is expired",
                status: false,
            });
        } else if (error.name === "JsonWebTokenError") {
            console.log("JsonWebTokenError");
            res.status(401).json({
                message: "Unauthorized! Access Token is invalid",
                status: false,
            });
        } else {
            res.status(401).json({
                message: "Unauthorized! Token verification failed",
                status: false,
            });
        }
    }
};

export default verifyToken;
