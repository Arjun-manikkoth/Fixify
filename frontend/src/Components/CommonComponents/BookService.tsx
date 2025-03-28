import React from "react";

const BookService: React.FC = () => {
    return (
        <div className="relative">
            {/* Background Image */}
            <img
                src="/Booking.jpg"
                alt="Booking Background"
                className="w-full h-[20rem] sm:h-[30rem] object-cover"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center w-full px-4 sm:px-6">
                {/* Heading Section */}
                <div className="text-center text-white mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2">
                        Emergency Repair Service
                    </h2>
                    <h3 className="text-base sm:text-lg font-medium mb-4 sm:mb-6 pt-2 sm:pt-3">
                        24 hrs for 7 days service
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default BookService;
