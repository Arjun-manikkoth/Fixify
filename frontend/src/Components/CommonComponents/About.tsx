import React from "react";
import { FaCheckCircle, FaUserAlt, FaUsers, FaSuitcase } from "react-icons/fa";

const About: React.FC = () => {
  return (
    <section className="py-40 bg-white w-full">
      <div className="w-full text-center px-6">
        {/* Heading Section */}
        <h2 className="text-4xl font-bold text-gray-800 mb-10">About Us</h2>
        <p className="text-lg text-gray-600 mb-16 max-w-6xl mx-auto">
          From quick fixes to major repairs, we connect you with trusted
          technicians who prioritize your satisfaction. Choose Fixify for
          reliable service, expert support, and results you can count on!
        </p>

        {/* Stats Section with Full-Width Background Image */}
        <div
          className="relative flex justify-around items-center py-16 w-full"
          style={{
            backgroundImage: 'url("/About.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width: "100vw",
            marginLeft: "-50vw",
            left: "50%",
            boxSizing: "border-box",
            backgroundColor: "rgba(0, 0, 0, 0.38)", // Darken the background
            backgroundBlendMode: "overlay", // Blend the image and color
          }}
        >
          {/* Years of Experience */}
          <div className="flex flex-col items-center text-white space-y-2">
            <FaCheckCircle className="text-4xl mb-2" />
            <p className="text-3xl font-semibold">2</p>
            <p className="text-sm">Years Experience</p>
          </div>

          {/* Expert Technicians */}
          <div className="flex flex-col items-center text-white space-y-2">
            <FaUserAlt className="text-4xl mb-2" />
            <p className="text-3xl font-semibold">12</p>
            <p className="text-sm">Expert Technicians</p>
          </div>

          {/* Satisfied Clients */}
          <div className="flex flex-col items-center text-white space-y-2">
            <FaUsers className="text-4xl mb-2" />
            <p className="text-3xl font-semibold">301</p>
            <p className="text-sm">Satisfied Clients</p>
          </div>

          {/* Completed Projects */}
          <div className="flex flex-col items-center text-white space-y-2">
            <FaSuitcase className="text-4xl mb-2" />
            <p className="text-3xl font-semibold">150</p>
            <p className="text-sm">Completed Projects</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
