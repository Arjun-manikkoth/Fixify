import React from "react";
import {FaFacebook, FaLinkedin, FaInstagram, FaTwitter} from "react-icons/fa";
import {FaMapMarkerAlt, FaEnvelope, FaPhoneAlt} from "react-icons/fa";

const Footer: React.FC = () => {
     return (
          <footer className="bg-gray-100 py-8 px-12">
               <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-center items-center">
                    {/* Get In Touch */}
                    <div className="flex flex-col items-center sm:items-start">
                         <h3 className="font-semibold text-lg sm:text-xl mb-3">Get In Touch</h3>
                         <div className="flex items-center space-x-2 text-sm sm:text-base">
                              <FaMapMarkerAlt className="text-brandBlue" size={18} />
                              <p>Kannur, Kerala, India</p>
                         </div>
                         <div className="flex items-center space-x-2 text-sm sm:text-base mt-2">
                              <FaEnvelope className="text-brandBlue" size={18} />
                              <p>fixify@gmail.com</p>
                         </div>
                         <div className="flex items-center space-x-2 text-sm sm:text-base mt-2">
                              <FaPhoneAlt className="text-brandBlue" size={18} />
                              <p>+91-9645031194</p>
                         </div>
                    </div>

                    {/* Our Services */}
                    <div className="flex flex-col items-center sm:items-start">
                         <h3 className="font-semibold text-lg sm:text-xl mb-3">Our Services</h3>
                         <ul className="space-y-2 text-sm sm:text-base">
                              <li>Electrical Repair</li>
                              <li>Construction</li>
                              <li>Plumbing</li>
                         </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col items-center sm:items-start">
                         <h3 className="font-semibold text-lg sm:text-xl mb-3">Quick Links</h3>
                         <ul className="space-y-2 text-sm sm:text-base">
                              <li>About Us</li>
                              <li>Our Services</li>
                              <li>Terms & Conditions</li>
                         </ul>
                    </div>

                    {/* Follow Us */}
                    <div className="flex flex-col items-center sm:items-start">
                         <h3 className="font-semibold text-lg sm:text-xl mb-3">Follow Us</h3>
                         <div className="flex space-x-4">
                              <a
                                   href="#"
                                   className="text-brandBlue hover:text-blue-800 transition-all duration-300"
                              >
                                   <FaFacebook size={24} />
                              </a>
                              <a
                                   href="#"
                                   className="text-brandBlue hover:text-blue-800 transition-all duration-300"
                              >
                                   <FaLinkedin size={24} />
                              </a>
                              <a
                                   href="#"
                                   className="text-brandBlue hover:text-blue-800 transition-all duration-300"
                              >
                                   <FaInstagram size={24} />
                              </a>
                              <a
                                   href="#"
                                   className="text-brandBlue hover:text-blue-800 transition-all duration-300"
                              >
                                   <FaTwitter size={24} />
                              </a>
                         </div>
                    </div>
               </div>

               {/* Footer Bottom */}
               <div className="text-center text-sm sm:text-base mt-8 text-gray-600">
                    <p>&copy; 2024 Fixify. All rights reserved.</p>
               </div>
          </footer>
     );
};

export default Footer;
