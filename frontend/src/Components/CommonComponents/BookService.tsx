import React from "react";

const BookService: React.FC = () => {
    return (
        <div className="relative">
            {/* Background Image */}
            <img
                src="/Booking.jpg"
                alt="Booking Background"
                className="w-full h-[30rem] object-cover"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center w-full px-4">
                {/* Heading Section */}
                <div className="text-center text-white mb-8">
                    <h2 className="text-4xl md:text-5xl font-bold mb-2">
                        Emergency Repair Service
                    </h2>
                    <h3 className="text-lg md:text-lg font-medium mb-6 pt-3">
                        24 hrs for 7 days service
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default BookService;
