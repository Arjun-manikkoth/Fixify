import React from "react";

const BookService: React.FC = () => {
     return (
          <div className="relative">
               {/* Background Image */}
               <img
                    src="/Booking.jpg"
                    alt="Booking Background"
                    className="w-full h-[40rem] object-cover"
               />

               {/* Dark Overlay */}
               <div className="absolute inset-0 bg-black bg-opacity-50"></div>

               {/* Overlay Content */}
               <div className="absolute inset-0 flex flex-col justify-center items-center w-full px-4">
                    {/* Heading Section */}
                    <div className="text-center text-white mb-8">
                         {/* Main Heading */}
                         <h2 className="text-4xl md:text-5xl font-bold mb-2">
                              Emergency Repair Service
                         </h2>
                         {/* Subheading */}
                         <h3 className="text-lg md:text-lg font-medium mb-6 pt-3">
                              24 hrs for 7 days service
                         </h3>
                    </div>

                    {/* Form Section */}
                    <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6 md:p-8 w-[90%] md:w-[50%]">
                         <form className="space-y-6">
                              {/* Service and Location Selection */}
                              <div className="flex flex-col md:flex-row gap-4">
                                   <div className="flex-1">
                                        <label
                                             htmlFor="service"
                                             className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                             Select Service
                                        </label>
                                        <select
                                             id="service"
                                             className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brandBlue"
                                        >
                                             <option value="">Choose a service</option>
                                             <option value="plumbing">Plumbing</option>
                                             <option value="painting">Painting</option>
                                             <option value="electrical">
                                                  Electrical Maintenance
                                             </option>
                                             <option value="carpentry">Carpentry</option>
                                             <option value="flooring">Flooring</option>
                                        </select>
                                   </div>
                                   <div className="flex-1">
                                        <label
                                             htmlFor="location"
                                             className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                             Select Location
                                        </label>
                                        <button
                                             type="button"
                                             className="w-full bg-gray-100 border border-gray-300 text-gray-700 py-2 rounded-md flex items-center justify-center hover:bg-gray-200 transition duration-200"
                                        >
                                             Choose Location on Map
                                        </button>
                                   </div>
                              </div>

                              {/* Date and Time Inputs */}
                              <div className="flex flex-col md:flex-row gap-4">
                                   <div className="flex-1">
                                        <label
                                             htmlFor="date"
                                             className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                             Select Date
                                        </label>
                                        <input
                                             type="date"
                                             id="date"
                                             className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brandBlue"
                                        />
                                   </div>
                                   <div className="flex-1">
                                        <label
                                             htmlFor="time"
                                             className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                             Select Time
                                        </label>
                                        <input
                                             type="time"
                                             id="time"
                                             className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brandBlue"
                                        />
                                   </div>
                              </div>

                              {/* Submit Button */}
                              <button
                                   type="button"
                                   className="w-full bg-brandBlue text-white py-2 rounded-md font-medium hover:bg-blue-600 transition duration-200"
                              >
                                   Show Availability
                              </button>
                         </form>
                    </div>
               </div>
          </div>
     );
};

export default BookService;
