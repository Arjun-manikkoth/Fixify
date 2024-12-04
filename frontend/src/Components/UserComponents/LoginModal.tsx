import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SignInApi } from "../../Api/UserApis";

interface SignIn {
  closeSignIn: () => void;
  openSignUp: () => void;
}

interface FormState {
  email: string;
  password: string;
}

const LoginModal: React.FC<SignIn> = (props) => {
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
      const response = await SignInApi(formData);
      console.log(response);
    }
  };
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60"
      onClick={() => {
        props.closeSignIn();
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
            onClick={() => props.openSignUp()}
          >
            Sign Up
          </span>
        </p>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default LoginModal;
