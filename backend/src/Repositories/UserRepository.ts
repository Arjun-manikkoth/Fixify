
import {SignUp,IUserWithOtp} from "../Interfaces/User/SignUpInterface";
import IUserRepository from "../Interfaces/User/UserRepositoryInterface";
import { IUser } from "../Models/UserModels/UserModel";
import User from "../Models/UserModels/UserModel";
import Otp from "../Models/CommonModels/OtpModel";
import { ObjectId } from "mongoose";

class UserRepository implements IUserRepository{

    async emailExists(email:string):Promise<IUser|null>{
        try{
           return User.findOne({email:email})
        }
        catch(error:any){
       console.log(error.message)
       return null;
        }
    }

 async insertUser(userData:SignUp):Promise<IUser|null>{
        try{
 
            const user = new User({
                name:userData.userName,
                email:userData.email,
                password:userData.password,
                mobile_no:userData.mobileNo
             })

           return  await user.save() 
        }
        catch(error:any){
            console.log(error.message)
            return null;
        }
    }

async storeOtp(otp:string,id:ObjectId):Promise<Boolean>{
    try{
   
      const otpNew = new Otp({
        account_id: id,
        value: otp
      })
    const otpSaved = await otpNew.save();
    
    return otpSaved?true:false;
   
    }
    catch(error:any){
        console.log(error.message)
        return false;
    }
}

async findUserByEmail(email:string):Promise<IUser|null>{
    try{
     return await User.findOne({email:email})
    }
    catch(error:any){
      console.log(error.message)
      return null;
    }
}
async findOtpWithId(userId:ObjectId):Promise<IUserWithOtp|null>{

    try{
      const data =await User.aggregate([
        {$match:{_id:userId}},
        {$lookup: {
            from: "otps",
            localField: "_id",
            foreignField: "account_id",
            as: "otp_details",
          }}
       ])

        const userWithOtp: IUserWithOtp = {
          user: data[0], 
          otp: data[0].otp_details,  
        };

        return userWithOtp;
   
    } 
    catch(error:any){
        console.log(error.message)
        return null;
    }

}
async verifyUser(id:ObjectId):Promise<Boolean>{
  try{
    const verified = await User.findByIdAndUpdate({_id:id},{$set:{is_verified:true}},{new:true})
    return true;
  }
  catch(error:any){
    console.log(error.message)
    return false;
  }
}

}
export default UserRepository