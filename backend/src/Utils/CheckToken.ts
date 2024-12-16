import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken"

interface IVerifyTokenResponse{
  id:string|null,
  email :string|null,
  role:string |null
  message:string
}

const verifyToken = async (token:string):Promise<IVerifyTokenResponse>=>{

    try{

     // Await the token verification and decode it
     const decoded =  jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;

  
     return {
      id: decoded.id,
      email:decoded.email,
      role:decoded.role,
      message:'Refresh Token valid'
    };
  
   } catch (error:any) {
  
     // Handle different types of errors
  
     if (error.name === 'TokenExpiredError') {
  
         return {
          id: null,
          email:null,
          role:null,
          message:'Refresh Token expired'
        };
       
     } else if (error.name === 'JsonWebTokenError') {
  
        return {
          id: null,
          email:null,
          role:null,
          message:'Refresh Token invalid'
        };
      
     } else {

     return {
      id: null,
      email:null,
      role:null,
      message:'Refresh Token verification failed'
    };
  
     }
    }
    }
    export {verifyToken}