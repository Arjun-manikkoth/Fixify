import React, {useState, useEffect} from "react";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import GoogleAuthWrapper from "../GoogleOAuthWrapper";

interface SignInProps {
     title: string;
     signInApi: (formData: FormState) => Promise<SignInResponse>;
     setReduxAction: (data: any) => any;
     role: "user" | "provider";
     navigateTo: string;
     openModal: (
          type:
               | "userSignUp"
               | "providerSignUp"
               | "userOtpVerify"
               | "providerOtpVerify"
               | "userForgotPassword"
               | "providerForgotPassword"
     ) => void;
     closeModal: () => void;
     message: string | null;
}

interface FormState {
     email: string;
     password: string;
}

interface SignInResponse {
     success: boolean;
     message: string;
     email?: string;
     id?: string;
     name?: string;
     phone?: string;
     service_id?: string;
     url?: string;
}

const SignInModal: React.FC<SignInProps> = ({
     title,
     signInApi,
     setReduxAction,
     role,
     navigateTo,
     openModal,
     closeModal,
     message,
}) => {
     const [formData, setFormData] = useState<FormState>({
          email: "",
          password: "",
     });

     const dispatch = useDispatch();
     const navigate = useNavigate();

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setFormData({...formData, [e.target.id]: e.target.value});
     };

     const validateEmail = (email: string): boolean => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
     };

     const validateSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          let isValid = true;

          if (formData.email.trim() === "") {
               toast.error("Please enter an email address");
               isValid = false;
          } else if (!validateEmail(formData.email)) {
               toast.error("Please enter a valid email.");
               isValid = false;
          }

          if (formData.password.trim().length < 8) {
               toast.error("Password must be at least 8 characters long.");
               isValid = false;
          }

          if (isValid) {
               const response = await signInApi(formData);

               if (response.success) {
                    //object to store the action creator argument
                    let reduxState = {};
                    if (role === "provider") {
                         reduxState = {
                              email: response.email,
                              id: response.id,
                              service_id: response.service_id,
                              name: response.name,
                              url: response.url,
                              phone: response.phone,
                         };
                    } else if (role === "user") {
                         reduxState = {
                              email: response.email,
                              id: response.id,
                              name: response.name,
                              phone: response.phone,
                              url: response.url,
                         };
                    }
                    dispatch(setReduxAction(reduxState));
                    navigate(navigateTo);
               } else {
                    if (response.message === "Didn't complete otp verification") {
                         openModal(`${role}OtpVerify`);
                    } else {
                         toast.error(response.message);
                    }
               }
          }
     };

     useEffect(() => {
          if (message) {
               toast.info(message);
          }
     }, [message]);

     return (
          <div
               className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60"
               onClick={closeModal}
          >
               <div
                    className="bg-white pt-10 pb-8 px-10 rounded-lg shadow-lg w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
               >
                    <h2 className="text-4xl font-semibold mb-11 text-center text-gray-900">
                         {title}
                    </h2>
                    <div className="flex justify-center mb-6">
                         <GoogleAuthWrapper />
                    </div>
                    <div className="flex items-center justify-center mb-6">
                         <div className="border-t border-gray-300 w-full"></div>
                         <span className="text-gray-500 text-sm px-2">or</span>
                         <div className="border-t border-gray-300 w-full"></div>
                    </div>
                    <form className="space-y-6" onSubmit={validateSignIn}>
                         <div>
                              <input
                                   type="email"
                                   id="email"
                                   placeholder="Enter Email Address"
                                   value={formData.email}
                                   onChange={handleInputChange}
                                   className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                              />
                         </div>
                         <div>
                              <input
                                   type="password"
                                   id="password"
                                   placeholder="Enter Password"
                                   value={formData.password}
                                   onChange={handleInputChange}
                                   className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                              />
                         </div>
                         <div className="flex justify-end">
                              <span
                                   className="text-sm text-slate-800 hover:underline"
                                   onClick={() => openModal(`${role}ForgotPassword`)}
                              >
                                   Forgot Password
                              </span>
                         </div>
                         <button
                              type="submit"
                              className="w-full py-3 bg-brandBlue text-white text-lg font-semibold rounded-lg hover:bg-brandBlue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                         >
                              Sign In
                         </button>
                    </form>
                    <p className="mt-4 text-center text-sm text-gray-600">
                         Don't have an Account?{" "}
                         <span
                              className="text-blue-500 hover:underline"
                              onClick={() => openModal(`${role}SignUp`)}
                         >
                              Sign Up
                         </span>
                    </p>
               </div>
               <ToastContainer position="bottom-right" />
          </div>
     );
};

export default SignInModal;
