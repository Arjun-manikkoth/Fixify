import React, {useState} from "react";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {signInApi} from "../../Api/AdminApis";
import {useDispatch, useSelector} from "react-redux";
import {setAdmin} from "../../Redux/AdminSlice";
import {Navigate, useNavigate} from "react-router-dom";
import {RootState} from "../../Redux/Store";

const AdminSignIn = () => {
     const [formData, setFormData] = useState({
          email: "",
          password: "",
     });

     const dispatch = useDispatch();
     const navigate = useNavigate();
     const admin = useSelector((state: RootState) => state.admin);

     if (admin.id) {
          return <Navigate to={"/admins/dashboard"} />;
     }

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const {id, value} = e.target;
          setFormData((prev) => ({...prev, [id]: value}));
     };

     //validate email
     const validateEmail = (email: string): boolean => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
     };

     //input validation
     const validateSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault(); //prevents default form submission event

          let isValid = true;

          //checks email field is empty
          if (formData.email.trim() === "") {
               toast.error("Please enter an email address");
               isValid = false;
          } else if (!validateEmail(formData.email)) {
               //validates email with the given regex

               toast.error("Please enter a valid email.");
               isValid = false;
          }

          //checks password length
          if (formData.password.trim().length < 8) {
               toast.error("Password must be at least 8 characters long.");
               isValid = false;
          }

          if (isValid) {
               const response = await signInApi(formData); // calls backend api with formdata for authentication
               if (response.success === true) {
                    //for a successfull response storing the authenticated adminss data in redux store by calling dispatch function
                    dispatch(
                         setAdmin({
                              email: response.email,
                              id: response.id,
                         })
                    );
                    // navigates to admins home after success full login
                    navigate("/admins/dashboard");
               } else {
                    toast.error(response.message);
               }
          }
     };

     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
               <div className="bg-white pt-10 pb-8 px-10 rounded-lg shadow-lg w-full max-w-sm">
                    <h2 className="text-4xl font-semibold mb-11 text-center text-gray-900">
                         Fixify Admin
                    </h2>
                    <form className="space-y-6" onSubmit={validateSignIn}>
                         <div>
                              <input
                                   type="email"
                                   id="email"
                                   placeholder="Enter Email Address"
                                   value={formData.email}
                                   onChange={handleInputChange}
                                   className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                              />
                         </div>
                         <div>
                              <input
                                   type="password"
                                   id="password"
                                   placeholder="Enter Password"
                                   value={formData.password}
                                   onChange={handleInputChange}
                                   className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                              />
                         </div>
                         <div className="pt-4 pb-5">
                              <button
                                   type="submit"
                                   className="w-full py-3 bg-brandBlue text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                   Sign In
                              </button>
                         </div>
                    </form>
               </div>
               <ToastContainer position="bottom-right" />
          </div>
     );
};

export default AdminSignIn;
