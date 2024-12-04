import React, { FC, useState } from "react";
import { FaMapMarkerAlt, FaEnvelope, FaBars, FaTimes } from "react-icons/fa";
import UserSignInModal from "../UserComponents/LoginModal";
import UserSignUpModal from "../UserComponents/SignUpModal";

const Header: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserSignIn, setShowUserSignIn] = useState(false);
  const [showUserSignUp, setShowUserSignUp] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const closeUserSignIn = () => {
    console.log("closed user sign in state changed to false");
    setShowUserSignIn(false);
  };
  const closeUserSignUp = () => {
    console.log(
      "closed user sign up state changed to false and closed user sign in "
    );
    setShowUserSignIn(false);
    setShowUserSignUp(false);
  };
  const openUserSignUp = () => {
    console.log("open user sign up state changed to true");
    setShowUserSignUp(true);
  };
  const openUserSignIn = () => {
    console.log("closed user sign up state changed to false");
    console.log("open user sign in state changed to true");
    setShowUserSignUp(false);
    setShowUserSignIn(true);
  };
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
              <span>New York</span>
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

            <button
              className="bg-brandBlue text-white font-regular text-lg px-6 py-[1.09rem] hover:bg-blue-600 flex items-center justify-center"
              onClick={() => {
                if (!showUserSignIn) {
                  setShowUserSignIn(true);
                }
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
      {showUserSignIn && (
        <UserSignInModal
          closeSignIn={closeUserSignIn}
          openSignUp={openUserSignUp}
        />
      )}
      {showUserSignUp && (
        <UserSignUpModal
          closeSignUp={closeUserSignUp}
          openSignIn={openUserSignIn}
        />
      )}
    </>
  );
};

export default Header;
