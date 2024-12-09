import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { signInApi } from "../../Api/UserApis";
import { useEffect } from "react";

interface SignInProps {
  openModal: (type:'userSignIn'|'userSignUp'|'userOtpVerify') => void;
  closeModal: () => void;
  message:string|null
}


interface FormState {
  email: string;
  password: string;
}

const SignInModal: React.FC<SignInProps> = (props) => {
  const [formData, setFormData] = useState<FormState>({
    email: "",
    password: "",
  });

  //form data input updation
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }
  //validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  //input validation
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
      console.log(response);
    }
  };
  
    useEffect(() => {
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
          User Sign In
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
            onClick={() => props.openModal('userSignUp')}
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
