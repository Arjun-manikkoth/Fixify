import axiosUser from "../Axios/UserInstance";
import { SignIn } from "../Interfaces/UserInterfaces/SignInInterface";
import { SignUp } from "../Interfaces/UserInterfaces/SignUpInterface";
import userRoutes from "../Endpoints/UserEndpoints";

const SignInApi = async (formData: SignIn) => {
  try {
    const response = await axiosUser.post(userRoutes.signIn, formData);
    return response;
  } catch (error: any) {
    console.log(error.message);
  }
};

const SignUpApi = async (formData: SignUp) => {
  try {
    const response = await axiosUser.post(userRoutes.signUp, formData);
    return response;
  } catch (error: any) {
    console.log(error.message);
  }
};

export { SignInApi, SignUpApi };
