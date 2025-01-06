import React, {useState} from "react";
import {toast, ToastContainer} from "react-toastify";

interface ISendMailResponse {
     success: boolean;
     message: string;
     data: any;
}

interface ForgotPasswordModalProps {
     closeModal: () => void;
     sendMail: (email: string) => Promise<ISendMailResponse>;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({closeModal, sendMail}) => {
     const [email, setEmail] = useState<string>("");
     const [error, setError] = useState<string>("");

     const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          let isValid = true;
          if (!email.trim()) {
               setError("Email is required.");
               isValid = false;
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
               setError("Please enter a valid email address.");
               isValid = false;
          }
          if (isValid) {
               sendMail(email)
                    .then((response) => {
                         if (response.success) {
                              toast.success(response.message);
                         } else {
                              toast.error(response.message);
                         }
                    })
                    .catch(() => {
                         console.log("error occured at forgot password");
                    });
          }
     };

     return (
          <div
               className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60"
               onClick={closeModal}
          >
               <div
                    className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
               >
                    <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                         Forgot Password
                    </h2>
                    <p className="text-sm text-center text-gray-600 mb-6">
                         No worries! Enter your registered email below, and we’ll send you
                         instructions to reset your password.
                    </p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                         {/* Input for Email */}
                         <div className="relative">
                              <input
                                   type="email"
                                   id="email"
                                   placeholder="Enter Email Address"
                                   value={email}
                                   onChange={(e) => setEmail(e.target.value)}
                                   className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition ease-in-out"
                              />
                              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                         </div>

                         {/* Submit Button */}
                         <button
                              type="submit"
                              className="w-full py-3 bg-brandBlue text-white text-lg font-medium rounded-lg shadow-md hover:bg-brandBlue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
                         >
                              Send Email
                         </button>
                    </form>
               </div>
               <ToastContainer position="bottom-right" />
          </div>
     );
};

export default ForgotPasswordModal;
