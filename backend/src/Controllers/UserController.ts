import IUserService from "../Interfaces/User/UserServiceInterface";
import { Request,Response } from "express";


class UserController{
 constructor(private UserService:IUserService){

 }

 async signUp(req:Request,res:Response):Promise<void>{
    try{
  
     const user = await this.UserService.createUser(req.body)
     if(user?.success===true){
      res.status(201).json({ success: true, message: user.message ,data:user.email});

     }else{
      res.status(400).json({ success: false, message: user?.message || "Sign up failed." });
     }
    }
    catch(error:any){
        console.log(error.message)
        res.status(500).json({ success: false, message: "Internal server error" });
    }
 }

 
 async signIn(req:Request,res:Response):Promise<void>{
  try{

   const response = await this.UserService.authenticateUser(req.body)

   if (response?.success) {
    res.status(200).json({ success: true, message: response.message });
  } else {
    // Error handling based on  error messages
    switch (response?.message) {
      case "Account doesnot exist":
        res.status(400).json({ success: false, message: response.message });
        break;
      case "Invalid Credentials":
        res.status(410).json({ success: false, message: response.message });
        break;
      default:
        res.status(500).json({ success: false, message: "Internal server error" });
        break;
    }
  }

  }
  catch(error:any){
      console.log(error.message)
      res.status(500).json({ success: false, message: "Internal server error" });
  }
}

 async otpVerify(req: Request, res: Response): Promise<void> {
    try {
      const otpStatus = await this.UserService.otpCheck(req.body.otp, req.body.email);
  
      // Check the OTP verification status 
      if (otpStatus.success) {
        res.status(200).json({ success: true, message: otpStatus.message });
      } else {
        // Error handling based on  error messages
        switch (otpStatus.message) {
          case "Invalid Otp":
            res.status(400).json({ success: false, message: otpStatus.message });
            break;
          case "Otp is expired":
            res.status(410).json({ success: false, message: otpStatus.message });
            break;
          case "Otp error":
            res.status(500).json({ success: false, message: otpStatus.message });
            break;
          default:
            res.status(404).json({ success: false, message: "User not found" });
            break;
        }
      }
    } catch (error: any) {
      console.error(error.message);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async otpResend(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.UserService.otpResend(req.body.email)
      if(status){
        res.status(200).json({ success: true, message: "Otp sent Successfully" });
      }else{
        res.status(500).json({ success: true, message: "Otp Cannot be send at this moment" });
      }
    } catch (error: any) {
      console.error(error.message);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
  
}
export default UserController;