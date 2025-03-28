import React from "react";
import { FaCheckCircle, FaUserAlt, FaUsers, FaSuitcase } from "react-icons/fa";

const About: React.FC = () => {
    return (
        <section className="py-20 sm:py-40 bg-white w-full">
            <div className="w-full text-center px-4 sm:px-6">
                {/* Heading Section */}
                <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-6 sm:mb-10">
                    About Us
                </h2>
                <p className="text-base sm:text-lg text-gray-600 mb-10 sm:mb-16 max-w-6xl mx-auto">
                    From quick fixes to major repairs, we connect you with trusted technicians who
                    prioritize your satisfaction. Choose Fixify for reliable service, expert
                    support, and results you can count on!
                </p>

                {/* Stats Section */}
                <div className="relative w-full">
                    <div
                        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-screen"
                        style={{
                            backgroundImage: 'url("/About.jpg")',
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            backgroundColor: "rgba(0, 0, 0, 0.38)",
                            backgroundBlendMode: "overlay",
                        }}
                    />
                    <div className="relative grid grid-cols-2 sm:flex sm:justify-around items-center py-10 sm:py-16 z-10 gap-6 sm:gap-0">
                        {/* Years of Experience */}
                        <div className="flex flex-col items-center text-white space-y-2">
                            <FaCheckCircle className="text-3xl sm:text-4xl mb-2" />
                            <p className="text-xs sm:text-sm">Unmatched Excellence</p>
                        </div>

                        {/* Expert Technicians */}
                        <div className="flex flex-col items-center text-white space-y-2">
                            <FaUserAlt className="text-3xl sm:text-4xl mb-2" />
                            <p className="text-xs sm:text-sm">Satisfied clients</p>
                        </div>

                        {/* Satisfied Clients */}
                        <div className="flex flex-col items-center text-white space-y-2">
                            <FaUsers className="text-3xl sm:text-4xl mb-2" />
                            <p className="text-xs sm:text-sm">Skilled technicians</p>
                        </div>

                        {/* Completed Projects */}
                        <div className="flex flex-col items-center text-white space-y-2">
                            <FaSuitcase className="text-3xl sm:text-4xl mb-2" />
                            <p className="text-xs sm:text-sm">Satisfactory bookings</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
