import axiosUser from "../Axios/UserInstance";
import { SignIn } from "../Interfaces/UserInterfaces/SignInInterface";
import { SignUp } from "../Interfaces/UserInterfaces/SignUpInterface";
import userRoutes from "../Endpoints/UserEndpoints";

interface ISignUpResponse{
  success:boolean,
  message:string,
  email?:string|null
}

const signInApi = async (formData: SignIn) => {
  try {
    const response = await axiosUser.post(userRoutes.signIn, formData);
    return {success:true,message:"Sucessfully signed Into Account",email:response.data.data}
  } catch (error: any) {
    console.log(error.message);
    return {
      success:false,
      message:error.response.data.message
    }
  }
};

const signUpApi = async (formData: SignUp):Promise<ISignUpResponse> => {
  try {
    const response = await axiosUser.post(userRoutes.signUp, formData);

     return {success:true,message:"Sucessfully Created Account",email:response.data.data}
  

  } catch (error: any) {
    console.log(error.message);
    return {success:false,
      message:error.response.data.message ||'something went wrong',
    }
    
  }
};

const otpVerifyApi= async(otp:string,email:string)=>{
  try{

  const response =await axiosUser.post(userRoutes.otpVerify,{otp:otp,email:email})
     return {
      success:true,
      message:"Please Sign to continue"
     }
  }
  catch(error:any){
    console.log(error.message)
    return{
      success:false,
      message:error.response.data.message    }
  }
}
const otpResendApi= async(email:string)=>{
  try{

  const response =await axiosUser.post(userRoutes.otpResend,{email:email})

      return {
        success:true,
        message:response.data.message
       }

  }
  catch(error:any){
    console.log(error.message)
    return{
      success:false,
      message:error.response.data.message    }
  }
}

export { signInApi, signUpApi ,otpVerifyApi,otpResendApi};
