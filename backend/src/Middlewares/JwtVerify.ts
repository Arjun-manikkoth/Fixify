// import {Request, Response, NextFunction} from "express";
// import jwt, {JwtPayload} from "jsonwebtoken";
// import UserRepository from "../Repositories/UserRepository";
// import ProviderRepository from "../Repositories/ProviderRepository";

// //create a user repository instance
// const userRepository = new UserRepository();
// //create a provider repository instance
// const providerRepository = new ProviderRepository();

// //verify token and role and check the blockstatus of admin user and provider
// const verifyTokenAndRole = (allowedRoles: string[]) => {
//      return (req: Request, res: Response, next: NextFunction) => {
//           try {
//                const token = req.cookies.accessToken;

//                if (!token) {
//                     res.status(401).json({message: "Access Token is missing", status: false});
//                } else {
//                     const decoded = jwt.verify(
//                          token,
//                          process.env.JWT_SECRET || "secret"
//                     ) as JwtPayload;

//                     if (!allowedRoles.includes(decoded.role)) {
//                          res.status(403).json({
//                               message: "Forbidden! Insufficient permissions",
//                               status: false,
//                          });
//                     } else {
//                          //checks whether the user is blocked
//                          if (decoded.role === "user") {
//                               userRepository
//                                    .getUserDataWithId(decoded.id)
//                                    .then((data) => {
//                                         if (data?.is_blocked) {
//                                              res.status(401).json({
//                                                   message: "Blocked by admin",
//                                                   status: false,
//                                              });
//                                         } else {
//                                              next();
//                                         }
//                                    })
//                                    .catch((error) => {
//                                         console.log("error");
//                                         res.status(500).json({
//                                              message: "Internal server error",
//                                              status: false,
//                                         });
//                                    });
//                          } else if (decoded.role === "provider") {
//                               providerRepository
//                                    .getProviderDataWithId(decoded.id)
//                                    .then((data) => {
//                                         if (data?.is_blocked) {
//                                              res.status(401).json({
//                                                   message: "Blocked by admin",
//                                                   status: false,
//                                              });
//                                         } else {
//                                              next();
//                                         }
//                                    })
//                                    .catch((error) => {
//                                         console.log("error");
//                                         res.status(500).json({
//                                              message: "Internal server error",
//                                              status: false,
//                                         });
//                                    });
//                          } else if (decoded.role === "admin") {
//                               next();
//                          }
//                     }
//                }
//           } catch (error: any) {
//                if (error.name === "TokenExpiredError") {
//                     res.status(401).json({
//                          message: "Unauthorized! Access Token is expired",
//                          status: false,
//                     });
//                } else if (error.name === "JsonWebTokenError") {
//                     res.status(401).json({
//                          message: "Unauthorized! Access Token is invalid",
//                          status: false,
//                     });
//                } else {
//                     res.status(401).json({
//                          message: "Unauthorized! Token verification failed",
//                          status: false,
//                     });
//                }
//           }
//      };
// };

// export default verifyTokenAndRole;

import {Request, Response, NextFunction} from "express";
import jwt, {JwtPayload} from "jsonwebtoken";

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

     if (!token) {
          res.status(401).json({message: "Access Token is missing", status: false});
     }

     try {
          // Decode the token
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;
          req.data = decoded;
          console.log("this is request data in jwt", req.data);
          next(); // Proceed to the next middleware
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

export default verifyToken;
