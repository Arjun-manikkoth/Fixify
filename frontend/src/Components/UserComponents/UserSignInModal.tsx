import React, {useState} from "react";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {signInApi} from "../../Api/UserApis";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {setUser} from "../../Redux/UserSlice";

//interface for sign in props
interface SignInProps {
     openModal: (type: "userSignUp" | "userOtpVerify") => void;
     closeModal: () => void;
     message: string | null;
}

//interface for input form data object
interface FormState {
     email: string;
     password: string;
}

const UserSignInModal: React.FC<SignInProps> = (props) => {
     const [formData, setFormData] = useState<FormState>({
          email: "",
          password: "",
     });

     const dispatch = useDispatch(); //initialises dispatch variable

     const navigate = useNavigate(); //initialises dispatch variable

     //form data input updation
     function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
          setFormData({...formData, [e.target.id]: e.target.value});
     }

     //validate email
     const validateEmail = (email: string): boolean => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
     };

     //input validation
     const validateSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault(); //prevents default form submission event

          let isValid = true;

          //checks email field is empty
          if (formData.email.trim() === "") {
               toast.error("Please enter an email address");
               isValid = false;
          } else if (!validateEmail(formData.email)) {
               //validates email with the given regex

               toast.error("Please enter a valid email.");
               isValid = false;
          }

          //checks password length
          if (formData.password.trim().length < 8) {
               toast.error("Password must be at least 8 characters long.");
               isValid = false;
          }

          if (isValid) {
               const response = await signInApi(formData); // calls backend api with formdata for authentication

               if (response.success === true) {
                    //for a successfull response storing the authenticated users data in redux store by calling dispatch function

                    dispatch(
                         setUser({
                              email: response.email,
                              id: response.id,
                              name: response.name,
                              phone: response.phone,
                         })
                    );

                    // navigates to user home after success full login
                    navigate("/users/home");
               } else {
                    //for unverified users proceed to complete otp verification process

                    if (response.message === "Didn't complete otp verification") {
                         // oepns the otp verify modal for user
                         props.openModal("userOtpVerify");
                    } else {
                         toast.error(response.message);
                    }
               }
          }
     };

     useEffect(() => {
          //displays the sign in message after otp verification
          if (props.message) {
               toast.info(props.message);
          }
     }, [props.message]); // Trigger this effect when message changes

     return (
          <div
               className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60"
               onClick={() => {
                    props.closeModal();
               }}
          >
               <div
                    className="bg-white pt-10 pb-8 px-10  rounded-lg shadow-lg w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
               >
                    <h2 className="text-4xl font-semibold mb-11 text-center text-gray-900">
                         Customer
                    </h2>
                    <form className="space-y-6" onSubmit={validateSignIn}>
                         <div>
                              <input
                                   type="email"
                                   id="email"
                                   placeholder="Enter Email Address"
                                   value={formData.email}
                                   onChange={handleInputChange}
                                   className="w-full px-4 py-3 border border-gray-500    rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
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
                              <a href="#" className="text-sm text-slate-800 hover:underline">
                                   Forgot Password
                              </a>
                         </div>
                         <button
                              type="submit"
                              className="w-full py-3 bg-brandBlue text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                         >
                              Sign In
                         </button>
                    </form>
                    <p className="mt-4 text-center text-sm text-gray-600">
                         Don't have an Account?{" "}
                         <span
                              className="text-blue-500 hover:underline"
                              onClick={() => props.openModal("userSignUp")}
                         >
                              Sign Up
                         </span>
                    </p>
               </div>
               <ToastContainer position="bottom-right" />
          </div>
     );
};

export default UserSignInModal;
