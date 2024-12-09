import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { signUpApi } from "../../Api/UserApis";

interface SignUpProps {
  openModal: (type:'userSignIn'|'userSignUp'|'userOtpVerify') => void;
  closeModal: () => void;
}

interface FormState {
  userName: string;
  email: string;
  mobileNo: string;
  password: string;
  passwordConfirm: string;
}

const SignUpModal: React.FC<SignUpProps> = ({ openModal,closeModal}) => {
  const [formData, setFormData] = useState<FormState>({
    userName: "",
    email: "",
    mobileNo: "",
    password: "",
    passwordConfirm: "",
  });


  //form data input updation
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }

  //validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  //validate password

  function validatePassword(password: string): boolean {
    let regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;
    return regex.test(formData.password.trim());
  }

  //input validation
  async function validateSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let isValid = true;
    console.log("this function is called");

    if (formData.userName.trim() === "") {
      toast.error("Please enter a username.");
      isValid = false;
    }

    if (formData.email.trim() === "") {
      toast.error("Please enter an email address");
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email.");
      isValid = false;
    }

    if (formData.mobileNo.trim() === "") {
      toast.error("Please enter a phone number");
      isValid = false;
    } else if (formData.mobileNo.trim().length !== 10) {
      toast.error("Phone number must be 10 digits.");
      isValid = false;
    }

    if (formData.password.trim().length < 8) {
      toast.error("Password must be at least 8 characters long.");
      isValid = false;
    } else {
      if (!validatePassword(formData.password.trim())) {
        toast.error(
          "Password must contain at least one uppercase letter, one number, and one special character."
        );
        isValid = false;
      } else {
        if (formData.passwordConfirm.trim() === "") {
          toast.error("Please Re-enter password ");
          isValid = false;
        } else if (formData.password.trim() !== formData.passwordConfirm) {
          toast.error("Passwords doesnt match");
          isValid = false;
        }
      }
    }

    if (isValid) {
      const response = await signUpApi(formData);
     if(response.success===true){
      sessionStorage.setItem("userEmail", response.email||"");
      //open otp verify modal
       openModal('userOtpVerify')

     }else{
      toast.error(response.message)
     }
    }

  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 overflow-y-auto"
      onClick={()=>closeModal()}
    >
      <div
        className="bg-white pt-10 pb-8 px-10 rounded-lg shadow-lg w-full max-w-md max-h-full overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <h2 className="text-4xl font-semibold mb-11 text-center text-gray-900">
          User Sign Up
        </h2>

        {/* Google Sign-In Button */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            className="flex items-center w-full py-3 px-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <FcGoogle className="h-6 w-6 mr-5 ml-2" />
            <span className="text-gray-600 text-base font-medium">
              Sign in with Google Account
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center mb-6">
          <div className="border-t border-gray-300 w-full"></div>
          <span className="text-gray-500 text-sm px-2">or</span>
          <div className="border-t border-gray-300 w-full"></div>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={validateSignUp}>
          {/* Name Input */}
          <input
            type="text"
            placeholder="Enter your Name"
            id="userName"
            maxLength={15}
            value={formData.userName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />

          {/* Email Input */}
          <input
            type="email"
            id="email"
            placeholder="Enter Email Address"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />

          {/* Mobile Number Input */}
          <input
            type="tel"
            id="mobileNo"
            placeholder="Enter Mobile no"
            value={formData.mobileNo}
            maxLength={13}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />

          {/* Password Input */}
          <input
            type="password"
            id="password"
            placeholder="Enter Password"
            maxLength={15}
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />

          {/* Confirm Password Input */}
          <input
            type="password"
            id="passwordConfirm"
            placeholder="Re-enter Password"
            maxLength={15}
            value={formData.passwordConfirm}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-brandBlue text-white text-lg rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign Up
          </button>
        </form>

        {/* Footer */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already Have An Account?{" "}
          <span
            className="text-blue-500 hover:underline cursor-pointer"
            onClick={()=>openModal('userSignIn')}
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
