// express.d.ts
import {JwtPayload} from "jsonwebtoken";

declare global {
     namespace Express {
          interface Request {
               data?: JwtPayload; // Add the 'user' property to the Request interface
          }
     }
}
