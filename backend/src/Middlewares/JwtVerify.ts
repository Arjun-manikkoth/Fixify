import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";


const verifyToken = async (req: Request, res: Response, next: NextFunction) => {

  try {

    const token = req.cookies.accessToken;

    if (!token) {

       res.status(401).json({ message: "Access Token is missing", status: false });
  
    }else{
      
        // Await the token verification and decode it
    const decoded =  jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;
    
    // If the token is valid, decoded will hold the payload
    console.log("Decoded token:", decoded);
 
    next();
    }

  } catch (error:any) {

    // Handle different types of errors 

    if (error.name === 'TokenExpiredError') {

         res.status(401).json({
        message: "Unauthorized! Access Token is expired",
        status: false,
      });

    } else if (error.name === 'JsonWebTokenError') {

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
export default verifyToken