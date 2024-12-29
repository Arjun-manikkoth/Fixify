import {Request, Response, NextFunction} from "express";

const verifyRole = (allowedRoles: string[]) => {
     return (req: Request, res: Response, next: NextFunction) => {
          const role = req.data?.role; // Get role from the request object (set by verifyToken)

          if (!allowedRoles.includes(role)) {
               res.status(403).json({
                    message: "Forbidden! Insufficient permissions",
                    status: false,
               });
          } else {
               next(); // Proceed to the next middleware
          }
     };
};

export default verifyRole;
