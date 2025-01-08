import React, {useState} from "react";
import {toast, ToastContainer} from "react-toastify";
import {useSelector} from "react-redux";
import {RootState} from "../../../Redux/Store";
// Change password form state interface
interface IChangePassword {
     currentPassword: string;
     confirmCurrentPassword: string;
}

// API response interface
interface IResponse {
     success: boolean;
     message: string;
     data: any;
}

interface IChangePasswordProps {
     title: string;
     role: "user" | "provider";
     verifyPassword: (id: string | null, currentPassword: string) => Promise<IResponse>;
     setModal: React.Dispatch<React.SetStateAction<"changePassword" | "newPassword" | "">>;
}

const ChangePasswordModal: React.FC<IChangePasswordProps> = ({
     title,
     role,
     verifyPassword,
     setModal,
}) => {
     const user = useSelector((state: RootState) => state.user);
     const provider = useSelector((state: RootState) => state.provider);

     // State to store the passwords
     const [formData, setFormData] = useState<IChangePassword>({
          currentPassword: "",
          confirmCurrentPassword: "",
     });

     // Form data input updation
     function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
          setFormData({...formData, [e.target.id]: e.target.value});
     }

     // Input validation
     const validateForm = async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault(); // Prevents default form submission event

          let isValid = true;

          // Check if current password is entered
          if (formData.currentPassword.trim().length === 0) {
               toast.error("Please enter your current password.");
               isValid = false;
          }

          // Check if confirm current password matches current password
          if (formData.confirmCurrentPassword.trim() === "") {
               toast.error("Please confirm your current password.");
               isValid = false;
          } else if (formData.currentPassword.trim() !== formData.confirmCurrentPassword.trim()) {
               toast.error("Current passwords don't match.");
               isValid = false;
          }

          let id = role === "user" ? user.id : provider.id;

          if (isValid) {
               const response = await verifyPassword(id, formData.currentPassword); // Call the API to verify the current password
               if (response.success === true) {
                    setModal("newPassword");
               } else {
                    toast.error(response.message);
               }
          }
     };

     return (
          <div
               className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60"
               onClick={() => {
                    setModal("");
               }}
          >
               <div
                    className="bg-white pt-8 pb-14 px-10 rounded-lg shadow-lg w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
               >
                    <h2 className="text-4xl font-semibold mb-12 text-center text-gray-900">
                         {title}
                    </h2>

                    <form className="space-y-7" onSubmit={validateForm}>
                         <div>
                              <input
                                   type="password"
                                   id="currentPassword"
                                   placeholder="Current Password"
                                   value={formData.currentPassword}
                                   onChange={handleInputChange}
                                   className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                              />
                         </div>
                         <div>
                              <input
                                   type="password"
                                   id="confirmCurrentPassword"
                                   placeholder="Confirm Current Password"
                                   value={formData.confirmCurrentPassword}
                                   onChange={handleInputChange}
                                   className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                              />
                         </div>

                         <button
                              type="submit"
                              className="w-full py-3 bg-brandBlue text-white text-lg font-semibold rounded-lg hover:bg-brandBlue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                         >
                              Change Password
                         </button>
                    </form>
               </div>
               <ToastContainer position="bottom-right" />
          </div>
     );
};

export default ChangePasswordModal;
