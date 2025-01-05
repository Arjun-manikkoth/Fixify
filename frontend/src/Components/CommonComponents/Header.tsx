import React, {FC, useState} from "react";
import {FaMapMarkerAlt, FaEnvelope, FaBars, FaTimes, FaUser} from "react-icons/fa";
import UserSignInModal from "../UserComponents/UserSignInModal";
import UserSignUpModal from "../UserComponents/UserSignUpModal";
import UserOtpVerificationModal from "../UserComponents/UserOtpVerificationModal";
import ProviderOtpVerificationModal from "../ProviderComponents/ProviderOtpVerificationModal";
import {useSelector} from "react-redux";
import {RootState} from "../../Redux/Store";
import {useNavigate} from "react-router-dom";
import ProviderSignInModal from "../ProviderComponents/ProviderSignInModal";
import ProviderSignUpModal from "../ProviderComponents/ProviderSignUpModal";
import UserForgotPasswordModal from "../UserComponents/UserForgotPassword";

export const ModalContext = React.createContext("");

const Header: FC = () => {
     const [isMenuOpen, setIsMenuOpen] = useState(false);

     const [modalType, setModalType] = useState<
          | "userSignIn"
          | "userSignUp"
          | "userOtpVerify"
          | "providerSignIn"
          | "providerSignUp"
          | "providerOtpVerify"
          | "userForgotPassword"
          | ""
     >("");
     console.log("header rendering");
     const [signInMessage, setSignInMessage] = useState<string | null>(null);

     const user = useSelector((state: RootState) => state.user);
     const provider = useSelector((state: RootState) => state.provider);

     const navigate = useNavigate();

     const openModal = (
          type:
               | "userSignIn"
               | "userSignUp"
               | "userOtpVerify"
               | "providerSignIn"
               | "providerSignUp"
               | "providerOtpVerify"
               | "userForgotPassword"
     ) => {
          setModalType(type);
     };
     const closeModal = () => {
          setModalType("");
     };
     const handleProfileNavigation = () => {
          if (user.id) navigate("/users/profile");
          else navigate("/providers/profile");
     };

     const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

     return (
          <>
               <div className="bg-gray-100 p-2 border-b border-gray-200 px-12">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                         <div className="flex items-center space-x-4 text-xs sm:text-sm md:text-base text-black">
                              <div className="flex items-center space-x-2">
                                   <FaMapMarkerAlt
                                        className="text-base sm:text-lg"
                                        style={{color: "#1E60AA"}}
                                   />
                                   <span>New York</span>
                              </div>
                              <div className="text-gray-400 hidden sm:block">|</div>

                              <div className="flex items-center space-x-3">
                                   <FaEnvelope
                                        className="text-base sm:text-lg"
                                        style={{color: "#1E60AA"}}
                                   />
                                   <span>fixifysolutions@gmail.com</span>
                              </div>
                         </div>

                         <div className="flex space-x-2 sm:space-x-4 md:space-x-6 text-xs sm:text-sm md:text-base text-black">
                              <a href="#" className="hover:text-gray-400">
                                   India
                              </a>
                              <span className=" text-gray-400">|</span>
                              <a href="#" className="hover:text-gray-400">
                                   Canada
                              </a>
                              <span className="text-gray-400">|</span>
                              <a href="#" className="hover:text-gray-400">
                                   Europe
                              </a>
                         </div>
                    </div>
               </div>

               <div className="p-0 px-12">
                    <div className="flex items-center justify-between h-16">
                         <div>
                              <img src="/FixifyLogo.png" alt="Fixify Logo" className="h-10" />
                         </div>

                         <div className="hidden md:flex items-center space-x-16">
                              <span className="text-lg font-medium text-gray-700 hover:text-gray-400">
                                   Home
                              </span>
                              <span className="text-lg font-medium text-gray-700 hover:text-gray-400">
                                   Services
                              </span>
                              <span className="text-lg font-medium text-gray-700 hover:text-gray-400">
                                   About
                              </span>

                              {/** hides provider sign in button for logged in user and provider */}
                              {user.id || provider.id ? null : ( //returns null for a logged in user or provider
                                   <span
                                        className="text-lg font-medium text-gray-700 hover:text-gray-400"
                                        onClick={() => openModal("providerSignIn")}
                                   >
                                        Join Us
                                   </span>
                              )}

                              {/** shows hello user and navigate to profile on click or shows book now button */}
                              {user.id || provider.id ? (
                                   <button
                                        className="flex items-center gap-3 px-4 py-2 rounded-md  text-gray-900 "
                                        onClick={handleProfileNavigation}
                                   >
                                        <FaUser className="w-5 h-5 text-brandBlue" />
                                        <span className="text-lg font-medium text-gray-700 ">
                                             Hi, {user.name || provider.name}
                                        </span>
                                   </button>
                              ) : (
                                   <button
                                        className="bg-brandBlue text-white font-regular text-lg px-6 py-[1.09rem] hover:bg-blue-600 flex items-center justify-center"
                                        onClick={() => {
                                             openModal("userSignIn");
                                        }}
                                   >
                                        Book Now
                                        <svg
                                             className="ml-2"
                                             xmlns="http://www.w3.org/2000/svg"
                                             fill="none"
                                             viewBox="0 0 36 24"
                                             strokeWidth="3"
                                             stroke="currentColor"
                                             width="30"
                                             height="30"
                                        >
                                             <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  d="M3 12h26m0 0l-6-6m6 6l-6 6"
                                             />
                                        </svg>
                                   </button>
                              )}
                         </div>

                         <div className="md:hidden flex items-center">
                              <button onClick={toggleMenu}>
                                   {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                              </button>
                         </div>
                    </div>

                    {isMenuOpen && (
                         <div className="md:hidden flex flex-col items-center bg-gray-100 p-4 space-y-4">
                              <a
                                   href="#"
                                   className="text-lg font-medium text-gray-700 hover:text-gray-400"
                              >
                                   Home
                              </a>
                              <a
                                   href="#"
                                   className="text-lg font-medium text-gray-700 hover:text-gray-400"
                              >
                                   Services
                              </a>
                              <a
                                   href="#"
                                   className="text-lg font-medium text-gray-700 hover:text-gray-400"
                              >
                                   About
                              </a>
                              <a
                                   href="#"
                                   className="text-lg font-medium text-gray-700 hover:text-gray-400"
                              >
                                   Join Us
                              </a>

                              <button className="bg-brandBlue text-white font-regular text-lg px-6 py-4 hover:bg-blue-600 flex items-center justify-center">
                                   Book Now
                                   <svg
                                        className="ml-2"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 36 24"
                                        strokeWidth="3"
                                        stroke="currentColor"
                                        width="30"
                                        height="30"
                                   >
                                        <path
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             d="M3 12h26m0 0l-6-6m6 6l-6 6"
                                        />
                                   </svg>
                              </button>
                         </div>
                    )}
               </div>
               <ModalContext.Provider value={modalType}>
                    {/* user sign in modal */}
                    {modalType === "userSignIn" && (
                         <UserSignInModal
                              closeModal={closeModal}
                              openModal={openModal}
                              message={signInMessage}
                         />
                    )}

                    {/* user otp verification modal */}
                    {modalType === "userOtpVerify" && (
                         <UserOtpVerificationModal
                              openModal={openModal}
                              otpOnSucess={setSignInMessage}
                         />
                    )}

                    {/* user sign up modal */}
                    {modalType === "userSignUp" && (
                         <ModalContext.Provider value="userSignUp">
                              <UserSignUpModal closeModal={closeModal} openModal={openModal} />
                         </ModalContext.Provider>
                    )}

                    {/* user forgot password */}
                    {modalType === "userForgotPassword" && (
                         <UserForgotPasswordModal closeModal={closeModal} />
                    )}

                    {/* provider sign in modal */}
                    {modalType === "providerSignIn" && (
                         <ProviderSignInModal
                              closeModal={closeModal}
                              openModal={openModal}
                              message={signInMessage}
                         />
                    )}

                    {/* provider sign up modal */}
                    {modalType === "providerSignUp" && (
                         <ProviderSignUpModal closeModal={closeModal} openModal={openModal} />
                    )}

                    {/* provider otp verification modal */}
                    {modalType === "providerOtpVerify" && (
                         <ProviderOtpVerificationModal
                              openModal={openModal}
                              otpOnSucess={setSignInMessage}
                         />
                    )}
               </ModalContext.Provider>
          </>
     );
};

export default Header;
