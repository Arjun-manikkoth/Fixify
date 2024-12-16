import React, {useState, useEffect} from "react";
import {otpVerifyApi} from "../../Api/ProviderApis";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {otpResendApi} from "../../Api/ProviderApis";

interface OtpVerifyProps {
     openModal: (type: "providerSignIn") => void;
     otpOnSucess: React.Dispatch<React.SetStateAction<string | null>>;
}

const OtpVerificationModal: React.FC<OtpVerifyProps> = ({openModal, otpOnSucess}) => {
     const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
     const [timer, setTimer] = useState<number>(120); // Timer starts at 120 seconds
     const [resendEnabled, setResendEnabled] = useState<boolean>(false);

     // Timer functionality
     useEffect(() => {
          let countdown: NodeJS.Timeout;

          if (timer > 0) {
               countdown = setInterval(() => {
                    setTimer((prev) => prev - 1);
               }, 1000);
          } else {
               setResendEnabled(true);
          }
          return () => clearInterval(countdown); // Cleanup interval on unmount or re-render
     }, [timer]);

     const handleChange = (value: string, index: number): void => {
          const newValue = value.slice(0, 1);
          const newOtp = [...otp];
          newOtp[index] = newValue;
          setOtp(newOtp);

          if (value && index < 5) {
               const nextInput = document.getElementById(`otp-input-${index + 1}`);
               nextInput?.focus();
          }
     };

     const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
          if (event.key === "Backspace" && !otp[index] && index > 0) {
               const prevInput = document.getElementById(`otp-input-${index - 1}`);
               prevInput?.focus();
          }
     };

     const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const oneTimePassword = otp.join("");
          const email = localStorage.getItem("providerEmail");

          if (!email) {
               console.error("Email not found in sessionStorage");
               return;
          }
          if (oneTimePassword.length === 6) {
               const response = await otpVerifyApi(oneTimePassword, email);
               if (response.success === true) {
                    openModal("providerSignIn");
                    otpOnSucess(response.message);
               } else {
                    toast.error(response.message);
               }
          } else {
               toast.error("Enter all the digits");
          }
     };

     const handleResendOtp = async () => {
          const email = localStorage.getItem("providerEmail") || "";
          const response = await otpResendApi(email);

          if (response.success === true) {
               toast.success("OTP sent successfully");
               setTimer(120);
               setResendEnabled(false);
          } else {
               toast.error(response.message);
          }
     };

     return (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
               <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
                    <h2 className="text-2xl font-bold text-center mb-5 text-gray-900">
                         Verify Account
                    </h2>
                    <p className="text-center text-gray-600 mb-10">
                         We’ve sent a one-time password (OTP) to your registered email. Enter the
                         code here to verify your account.
                    </p>
                    <form onSubmit={handleOtpSubmit}>
                         <div className="flex justify-center space-x-2 mb-8">
                              {Array.from({length: 6}).map((_, index) => (
                                   <input
                                        key={index}
                                        type="number"
                                        value={otp[index]}
                                        maxLength={1}
                                        id={`otp-input-${index}`}
                                        className="w-12 h-12 text-center border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                                        onChange={(e) => handleChange(e.target.value, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                   />
                              ))}
                         </div>
                         <button
                              type="submit"
                              className="w-full py-3 bg-brandBlue text-white text-lg rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                         >
                              Verify
                         </button>
                    </form>
                    <div className="mt-4 text-center">
                         <p className="text-gray-500">
                              {timer > 0 ? (
                                   <>
                                        {Math.floor(timer / 60)}:
                                        {String(timer % 60).padStart(2, "0")}{" "}
                                        <span className="text-gray-400">Resend</span>
                                   </>
                              ) : (
                                   <span
                                        className="text-blue-500 cursor-pointer hover:underline"
                                        onClick={handleResendOtp}
                                   >
                                        Resend
                                   </span>
                              )}
                         </p>
                    </div>
               </div>
               <ToastContainer position="bottom-right" />
          </div>
     );
};

export default OtpVerificationModal;
