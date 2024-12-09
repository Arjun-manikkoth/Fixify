import IUserService from "../Interfaces/User/UserServiceInterface";
import {SignUp} from "../Interfaces/User/SignUpInterface";
import IUserRepository from "../Interfaces/User/UserRepositoryInterface";
import { messages } from "../Constants/Messages";
import { generateOtp,hashOtp,compareOtps} from "../Utils/GenerateOtp";
import { sentOtpVerificationMail } from "../Utils/SendOtpMail";
import { ObjectId } from "mongoose";
import { hashPassword } from "../Utils/HashPassword";

export interface ISignUpResponse{
success:boolean,
message:string,
email:string|null
}

export interface IOtpResponse{
success:boolean,
message:string
}

class UserService implements IUserService{

  constructor(private userRepository:IUserRepository){

  }

  //creating user account
async createUser(userData:SignUp):Promise<ISignUpResponse|null>{
  try{

    const exists = await this.userRepository.emailExists(userData.email)

    if(!exists){
      
      const hashedPassword =  await hashPassword(userData.password)
      userData.password =hashedPassword;

      const status = await this.userRepository.insertUser(userData)

      if(status){
        
       const otpStatus =await this.otpSend(status.email,status._id) //sending otp via email
          if(otpStatus){
            return {
              success:true,
              message:messages.authentication.signUpSucess,
              email:status.email
            }
          }else{
            return {
              success:false,
              message:messages.authentication.emailOtpFailure,
              email:status.email
            }
          }    
      }else{
          return {
            success:false,
            message:messages.authentication.signUpFailure,
            email:null
          }
      }
    }else{
      return {
        success:false,
        message:messages.authentication.dupicateEmail,
        email:null
      }
    }
 
  }
  catch(error:any){
    console.log(error.message)
 return null;
 ;
  }
}

//generate and send otp via mail
async otpSend(email:string,id:ObjectId):Promise<boolean>{
try{

 const otp =generateOtp() //generate otp
 
 const mail = await sentOtpVerificationMail(email,otp)

  if(mail){
    const hashedOtp = await hashOtp(otp)
    const otpStatus = await this.userRepository.storeOtp(hashedOtp,id)

  return  otpStatus?true:false;
  
  }
 return mail;

}
catch(error:any){
  console.log(error.message)
  return false;
}
}

//generate and send otp via mail
async otpReSend(email:string,id:ObjectId):Promise<boolean>{
  try{
  
   const otp =generateOtp() //generate otp
   
   const mail = await sentOtpVerificationMail(email,otp)
  
    if(mail){
      const hashedOtp = await hashOtp(otp)
      const otpStatus = await this.userRepository.storeOtp(hashedOtp,id)
  
    return  otpStatus?true:false;
    
    }
   return mail;
  
  }
  catch(error:any){
    console.log(error.message)
    return false;
  }
  }
  async otpResend(email:string):Promise<boolean>{
    try{

      const data =await this.userRepository.findUserByEmail(email)
      
      if(data){
      
        const otp =generateOtp() //generate otp
      
        const mail = await sentOtpVerificationMail(email,otp)
    
        if(mail){
          const hashedOtp = await hashOtp(otp)
          const otpStatus = await this.userRepository.storeOtp(hashedOtp,data._id)
      
        return  otpStatus?true:false;
        
        }
        return mail;
      }
     
     return false;
    }
    catch(error:any){
      console.log(error.message)
      return false;
    }
    }
async otpCheck(otp: string,email:string): Promise<IOtpResponse> {
  {
    try{

      const user = await this.userRepository.findUserByEmail(email)

   if(user){

          //lookup document with user and otp
            const data =await this.userRepository.findOtpWithId(user._id)

            //checking otp in result
            if(data?.otp[0]?.value){

                //comparing otps
                const otpStatus =await compareOtps(otp,data.otp[0].value)
                  
                if(otpStatus){

                    const verified=  await this.userRepository.verifyUser(user._id)
                    return  { success: true, message: "Otp verified successfully" };

                }else{
                    return { success: false, message: "Invalid Otp" }
                }
                
            }else if(!data?.otp.length){

              return {success:false,message:"Otp is expired"}

            }else{

              return{success:false,message:"Otp error"}
            }
      }
        return {
          success:false,
          message:"User not found"
        }
       
    }
    catch(error:any){
      console.log(error.message)
      return{success:false,message:"Otp error"}
    }
  }
}

}

export default UserService;