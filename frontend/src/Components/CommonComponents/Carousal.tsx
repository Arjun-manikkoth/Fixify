import React from "react";
import { FaSearch } from "react-icons/fa";

const Carousal: React.FC = () => {
  return (
    <div className="relative">
      <img
        src="/Carousal.jpg"
        alt="carousal"
        className="w-full h-auto object-cover"
      />

      <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center text-center bg-black bg-opacity-50">
        <div className="text-white px-4">
          <h3 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8">
            Find Trusted Professionals For Every Job
          </h3>

          <h4 className="text-sm sm:text-base md:text-lg lg:text-xl max-w-xl sm:max-w-2xl mx-auto mb-6">
            From electricians to painters, our skilled experts are here to
            handle any project, big or small.
          </h4>
          <div className="flex justify-center mt-8">
            <button className="bg-brandBlue text-white text-sm sm:text-base font-medium px-5 py-2 sm:px-6 sm:py-3 rounded-md flex items-center space-x-2 sm:space-x-3 shadow-lg hover:bg-blue-600 transition duration-200">
              <span>Find Now</span>
              <FaSearch className="w-4 h-4 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carousal;
