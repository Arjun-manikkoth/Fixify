import React, { FC, useState } from "react";
import { FaMapMarkerAlt, FaEnvelope, FaBars, FaTimes, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/Store";
import { useNavigate } from "react-router-dom";
import ForgotPasswordModal from "./Modals/ForgotPasswordModal";
import ResetPasswordModal from "./Modals/ResetPasswordModal";
import SignUpModal from "./Modals/SignUpModal";
import OtpVerifyModal from "./Modals/OtpVerifyModal";
import SignInModal from "./Modals/SignInModal";
import {
    otpVerifyApi as otpVerifyApiUser,
    otpResendApi as otpResendApiUser,
    resetPasswordApi as resetPasswordApiUser,
    forgotOtpVerifyApi as forgotOtpVerifyApiUser,
    forgotPasswordApi as forgotPasswordApiUser,
    signUpApi as signUpApiUser,
    signInApi as signInApiUser,
} from "../../Api/UserApis";
import {
    otpResendApi as otpResendApiProvider,
    otpVerifyApi as otpVerifyApiProvider,
    resetPasswordApi as resetPasswordApiProvider,
    forgotPasswordApi as forgotPasswordApiProvider,
    forgotOtpVerifyApi as forgotOtpVerifyApiProvider,
    signUpApi as signUpApiProvider,
    signInApi as signInApiProvider,
    getServices,
} from "../../Api/ProviderApis";
import { setUser } from "../../Redux/UserSlice";
import { setProvider } from "../../Redux/ProviderSlice";

export const ModalContext = React.createContext("");

// Add props interface for scroll functions
interface HeaderProps {
    scrollToHome: () => void;
    scrollToServices: () => void;
    scrollToAbout: () => void;
}

const Header: FC<HeaderProps> = ({ scrollToHome, scrollToServices, scrollToAbout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [modalType, setModalType] = useState<
        | "userSignIn"
        | "userSignUp"
        | "userOtpVerify"
        | "providerSignIn"
        | "providerSignUp"
        | "providerOtpVerify"
        | "userForgotPassword"
        | "providerForgotPassword"
        | "userPasswordOtp"
        | "providerPasswordOtp"
        | "resetPasswordUser"
        | "resetPasswordProvider"
        | ""
    >("");

    const [signInMessage, setSignInMessage] = useState<string>("");

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
            | "providerForgotPassword"
            | "userPasswordOtp"
            | "providerPasswordOtp"
            | "resetPasswordUser"
            | "resetPasswordProvider"
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

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);

    return (
        <>
            <div className="bg-gray-100 p-2 border-b border-gray-200 px-12">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-4 text-xs sm:text-sm md:text-base text-black">
                        <div className="flex items-center space-x-2">
                            <FaMapMarkerAlt
                                className="text-base sm:text-lg"
                                style={{ color: "#1E60AA" }}
                            />
                            <span>India</span>
                        </div>
                        <div className="text-gray-400 hidden sm:block">|</div>
                        <div className="flex items-center space-x-3">
                            <FaEnvelope
                                className="text-base sm:text-lg"
                                style={{ color: "#1E60AA" }}
                            />
                            <span>fixifysolutions@gmail.com</span>
                        </div>
                    </div>
                    <div className="flex space-x-2 sm:space-x-4 md:space-x-6 text-xs sm:text-sm md:text-base text-black">
                        <a href="#" className="hover:text-gray-400">
                            Kerela
                        </a>
                        <span className="text-gray-400">|</span>
                        <a href="#" className="hover:text-gray-400">
                            Bangalore
                        </a>
                        <span className="text-gray-400">|</span>
                        <a href="#" className="hover:text-gray-400">
                            Chennai
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
                        <span
                            className="text-lg font-medium text-gray-700 hover:text-gray-400 cursor-pointer"
                            onClick={scrollToHome}
                        >
                            Home
                        </span>
                        <span
                            className="text-lg font-medium text-gray-700 hover:text-gray-400 cursor-pointer"
                            onClick={scrollToServices}
                        >
                            Services
                        </span>
                        <span
                            className="text-lg font-medium text-gray-700 hover:text-gray-400 cursor-pointer"
                            onClick={scrollToAbout}
                        >
                            About
                        </span>

                        {user.id || provider.id ? null : (
                            <span
                                className="text-lg font-medium text-gray-700 hover:text-gray-400 cursor-pointer"
                                onClick={() => openModal("providerSignIn")}
                            >
                                Join Us
                            </span>
                        )}

                        {user.id || provider.id ? (
                            <button
                                className="flex items-center gap-3 px-4 py-2 rounded-md text-gray-900"
                                onClick={handleProfileNavigation}
                            >
                                <FaUser className="w-5 h-5 text-brandBlue" />
                                <span className="text-lg font-medium text-gray-700">
                                    Hi, {user.name || provider.name}
                                </span>
                            </button>
                        ) : (
                            <button
                                className="bg-brandBlue text-white font-regular text-lg px-6 py-[1.09rem] hover:bg-blue-600 flex items-center justify-center"
                                onClick={() => openModal("userSignIn")}
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
                        <span
                            className="text-lg font-medium text-gray-700 hover:text-gray-400 cursor-pointer"
                            onClick={() => {
                                scrollToHome();
                                toggleMenu(); // Close menu after click
                            }}
                        >
                            Home
                        </span>
                        <span
                            className="text-lg font-medium text-gray-700 hover:text-gray-400 cursor-pointer"
                            onClick={() => {
                                scrollToServices();
                                toggleMenu(); // Close menu after click
                            }}
                        >
                            Services
                        </span>
                        <span
                            className="text-lg font-medium text-gray-700 hover:text-gray-400 cursor-pointer"
                            onClick={() => {
                                scrollToAbout();
                                toggleMenu(); // Close menu after click
                            }}
                        >
                            About
                        </span>
                        {user.id || provider.id ? null : (
                            <span
                                className="text-lg font-medium text-gray-700 hover:text-gray-400 cursor-pointer"
                                onClick={() => {
                                    openModal("providerSignIn");
                                    toggleMenu(); // Close menu after click
                                }}
                            >
                                Join Us
                            </span>
                        )}

                        <button
                            className="bg-brandBlue text-white font-regular text-lg px-6 py-4 hover:bg-blue-600 flex items-center justify-center"
                            onClick={() => {
                                openModal("userSignIn");
                                toggleMenu(); // Close menu after click
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
                    </div>
                )}
            </div>

            <ModalContext.Provider value={modalType}>
                {modalType === "userSignIn" && (
                    <SignInModal
                        title="Customer"
                        signInApi={signInApiUser}
                        role="user"
                        setReduxAction={setUser}
                        navigateTo="/users/profile"
                        closeModal={closeModal}
                        openModal={openModal}
                        message={signInMessage}
                    />
                )}
                {modalType === "userSignUp" && (
                    <SignUpModal
                        role="user"
                        openModal={openModal}
                        closeModal={closeModal}
                        handleSignUp={signUpApiUser}
                    />
                )}
                {modalType === "userOtpVerify" && (
                    <OtpVerifyModal
                        title="Verify Account"
                        onSubmit={otpVerifyApiUser}
                        onResend={otpResendApiUser}
                        accountType="user"
                        mailType="userEmail"
                        openModal={openModal}
                        message="We’ve sent a one-time password (OTP) to your registered email. Enter the code here to verify your account."
                        messageDisplay={setSignInMessage}
                    />
                )}
                {modalType === "userForgotPassword" && (
                    <ForgotPasswordModal
                        closeModal={closeModal}
                        openModal={openModal}
                        accountType="user"
                        sendMail={forgotPasswordApiUser}
                    />
                )}
                {modalType === "userPasswordOtp" && (
                    <OtpVerifyModal
                        title="Verify Email"
                        onSubmit={forgotOtpVerifyApiUser}
                        onResend={otpResendApiUser}
                        accountType="user"
                        mailType="userEmail"
                        openModal={openModal}
                        message="Enter the one-time password (OTP) send to your mail associated with your account for verification."
                    />
                )}
                {modalType === "resetPasswordUser" && (
                    <ResetPasswordModal
                        title="Reset Password"
                        accountType="user"
                        openModal={openModal}
                        messageDisplay={setSignInMessage}
                        submitPassword={resetPasswordApiUser}
                    />
                )}
                {modalType === "providerSignIn" && (
                    <SignInModal
                        title="Provider"
                        signInApi={signInApiProvider}
                        role="provider"
                        setReduxAction={setProvider}
                        navigateTo="/providers/profile"
                        closeModal={closeModal}
                        openModal={openModal}
                        message={signInMessage}
                    />
                )}
                {modalType === "providerSignUp" && (
                    <SignUpModal
                        role="provider"
                        openModal={openModal}
                        closeModal={closeModal}
                        handleSignUp={signUpApiProvider}
                        getServices={getServices}
                    />
                )}
                {modalType === "providerOtpVerify" && (
                    <OtpVerifyModal
                        title="Verify Account"
                        onSubmit={otpVerifyApiProvider}
                        onResend={otpResendApiProvider}
                        accountType="provider"
                        mailType="providerEmail"
                        openModal={openModal}
                        message="We’ve sent a one-time password (OTP) to your registered email. Enter the code here to verify your account."
                        messageDisplay={setSignInMessage}
                    />
                )}
                {modalType === "providerForgotPassword" && (
                    <ForgotPasswordModal
                        closeModal={closeModal}
                        openModal={openModal}
                        accountType="provider"
                        sendMail={forgotPasswordApiProvider}
                    />
                )}
                {modalType === "providerPasswordOtp" && (
                    <OtpVerifyModal
                        title="Verify Email"
                        onSubmit={forgotOtpVerifyApiProvider}
                        onResend={otpResendApiProvider}
                        accountType="provider"
                        mailType="providerEmail"
                        openModal={openModal}
                        message="Enter the one-time password (OTP) send to your mail associated with your account for verification."
                    />
                )}
                {modalType === "resetPasswordProvider" && (
                    <ResetPasswordModal
                        title="Reset Password"
                        accountType="provider"
                        openModal={openModal}
                        messageDisplay={setSignInMessage}
                        submitPassword={resetPasswordApiProvider}
                    />
                )}
            </ModalContext.Provider>
        </>
    );
};

export default Header;
