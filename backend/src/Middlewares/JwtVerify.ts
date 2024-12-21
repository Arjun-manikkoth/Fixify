import {Request, Response, NextFunction} from "express";
import jwt, {JwtPayload} from "jsonwebtoken";

const verifyTokenAndRole = (allowedRoles: string[]) => {
     return (req: Request, res: Response, next: NextFunction) => {
          try {
               const token = req.cookies.accessToken;

               if (!token) {
                    res.status(401).json({message: "Access Token is missing", status: false});
               }

               const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;

               if (!allowedRoles.includes(decoded.role)) {
                    res.status(403).json({
                         message: "Forbidden! Insufficient permissions",
                         status: false,
                    });
               } else {
                    next();
               }
          } catch (error: any) {
               if (error.name === "TokenExpiredError") {
                    res.status(401).json({
                         message: "Unauthorized! Access Token is expired",
                         status: false,
                    });
               } else if (error.name === "JsonWebTokenError") {
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
};

export default verifyTokenAndRole;
