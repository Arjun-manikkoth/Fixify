import React, {useState, useEffect} from "react";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GoogleAuthWrapper from "../GoogleOAuthWrapper";
import {FaEye, FaEyeSlash} from "react-icons/fa";

interface IServiceData {
     _id: string;
     name: string;
     description: string;
     is_active: boolean;
}

interface IServiceResponse {
     success: boolean;
     message: string;
     services: IServiceData[] | [];
}

interface SignUpModalProps {
     role: "user" | "provider";
     openModal: (
          type: "userOtpVerify" | "providerOtpVerify" | "userSignIn" | "providerSignIn"
     ) => void;
     closeModal: () => void;
     handleSignUp: (formData: any) => Promise<any>;
     getServices?: () => Promise<IServiceResponse>;
}

interface FormState {
     userName: string;
     email: string;
     service_id?: string;
     mobileNo: string;
     password: string;
     passwordConfirm: string;
}

const SignUpModal: React.FC<SignUpModalProps> = ({
     role,
     openModal,
     closeModal,
     handleSignUp,
     getServices,
}) => {
     const [formData, setFormData] = useState<FormState>({
          userName: "",
          email: "",
          service_id: "",
          mobileNo: "",
          password: "",
          passwordConfirm: "",
     });

     const [services, setServices] = useState<IServiceData[]>([]);

     const [inputType, setInputType] = useState<{password: boolean; passwordConfirm: boolean}>({
          password: false,
          passwordConfirm: false,
     });

     useEffect(() => {
          if (role === "provider" && getServices) {
               getServices()
                    .then((data) => {
                         if (data.success) setServices(data.services);
                    })
                    .catch(() => {});
          }
     }, [role, getServices]);

     const toggleEyeButton = (input: "password" | "passwordConfirm") => {
          setInputType((prev) => ({
               ...prev,
               [input]: !prev[input],
          }));
     };

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
          setFormData({...formData, [e.target.id]: e.target.value});
     };

     const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
     const validatePassword = (password: string) =>
          /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/.test(password);

     const validateForm = () => {
          let isValid = true;

          if (!formData.userName.trim()) {
               toast.error("Please enter a username.");
               isValid = false;
          }

          if (!formData.email.trim() || !validateEmail(formData.email)) {
               toast.error("Please enter a valid email.");
               isValid = false;
          }

          if (role === "provider" && !formData.service_id) {
               toast.error("Please select a service.");
               isValid = false;
          }

          if (!formData.mobileNo.trim() || formData.mobileNo.trim().length !== 10) {
               toast.error("Phone number must be 10 digits.");
               isValid = false;
          }

          if (formData.password.trim().length < 8 || !validatePassword(formData.password)) {
               toast.error("Password must meet complexity requirements.");
               isValid = false;
          }

          if (formData.password !== formData.passwordConfirm) {
               toast.error("Passwords do not match.");
               isValid = false;
          }

          return isValid;
     };

     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          if (!validateForm()) return;

          const response = await handleSignUp(formData);
          if (response.success) {
               localStorage.setItem(`${role}Email`, response.email || "");
               openModal(`${role}OtpVerify`);
          } else {
               toast.error(response.message);
          }
     };

     return (
          <div
               className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 overflow-y-auto"
               onClick={closeModal}
          >
               <div
                    className="bg-white pt-10 pb-8 px-10 rounded-lg shadow-lg w-full max-w-md max-h-full overflow-y-auto scrollbar-hide"
                    onClick={(e) => e.stopPropagation()}
               >
                    <h2 className="text-4xl font-semibold mb-11 text-center text-gray-900">
                         {role === "user" ? "Customer" : "Service Provider"}
                    </h2>

                    <div className="flex justify-center mb-6">
                         <GoogleAuthWrapper />
                    </div>

                    <div className="flex items-center justify-center mb-6">
                         <div className="border-t border-gray-300 w-full"></div>
                         <span className="text-gray-500 text-sm px-2">or</span>
                         <div className="border-t border-gray-300 w-full"></div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                         <input
                              type="text"
                              id="userName"
                              placeholder="Enter your Name"
                              value={formData.userName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                         />
                         <input
                              type="email"
                              id="email"
                              placeholder="Enter Email Address"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                         />
                         {role === "provider" && (
                              <select
                                   id="service_id"
                                   value={formData.service_id}
                                   onChange={handleInputChange}
                                   className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              >
                                   <option value="" disabled>
                                        Select Your Service
                                   </option>
                                   {services.map((service) => (
                                        <option key={service._id} value={service._id}>
                                             {service.name}
                                        </option>
                                   ))}
                              </select>
                         )}
                         <input
                              type="tel"
                              id="mobileNo"
                              placeholder="Enter Mobile Number"
                              value={formData.mobileNo}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                         />
                         <div className="relative w-full">
                              <input
                                   type={inputType.password ? "text" : "password"}
                                   id="password"
                                   placeholder="Enter Password"
                                   value={formData.password}
                                   onChange={handleInputChange}
                                   className="w-full px-4 py-3 pr-10 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                              />
                              <span
                                   onClick={() => toggleEyeButton("password")}
                                   className="absolute inset-y-0 right-6 flex items-center cursor-pointer"
                              >
                                   {inputType.password ? <FaEye /> : <FaEyeSlash />}
                              </span>
                         </div>

                         <div className="relative w-full">
                              <input
                                   type={inputType.passwordConfirm ? "text" : "password"}
                                   id="passwordConfirm"
                                   placeholder="Confirm Password"
                                   value={formData.passwordConfirm}
                                   onChange={handleInputChange}
                                   className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                              <span
                                   onClick={() => toggleEyeButton("passwordConfirm")}
                                   className="absolute inset-y-0 right-6 flex items-center cursor-pointer"
                              >
                                   {inputType.passwordConfirm ? <FaEye /> : <FaEyeSlash />}
                              </span>
                         </div>

                         <button
                              type="submit"
                              className="w-full py-3 bg-brandBlue text-white text-lg rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                         >
                              Sign Up
                         </button>
                    </form>
                    <p className="mt-4 text-center text-sm text-gray-600">
                         Already Have An Account?{" "}
                         <span
                              className="text-blue-500 hover:underline cursor-pointer"
                              onClick={() => openModal(`${role}SignIn`)}
                         >
                              Sign In
                         </span>
                    </p>
               </div>
               <ToastContainer position="bottom-right" />
          </div>
     );
};

export default SignUpModal;
