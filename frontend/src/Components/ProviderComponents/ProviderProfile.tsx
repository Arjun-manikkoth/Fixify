import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../Redux/Store";
import {toast, ToastContainer} from "react-toastify";
import {useRef} from "react";
import {getProviderData, updateProfile} from "../../Api/ProviderApis";
import {cloudinaryApi} from "../../Api/UserApis";
import {useDispatch} from "react-redux";
import {setProvider} from "../../Redux/ProviderSlice";
import {profileData} from "../../Interfaces/ProviderInterfaces/SignInInterface";
import {Provider} from "../../Interfaces/ProviderInterfaces/SignInInterface";

const ProviderProfile: React.FC = () => {
     const ref = useRef<HTMLInputElement | null>(null);

     const dispatch = useDispatch();

     const [profileData, setProfileData] = useState<Provider>({
          _id: "",
          name: "",
          email: "",
          mobile_no: "",
          url: "",
          address_id: "",
          chosen_address_id: "",
          service_id: "",
          is_verified: null,
          is_blocked: null,
          is_deleted: null,
          is_approved: null,
          google_id: null,
     });

     const provider = useSelector((state: RootState) => state.provider);

     const [formData, setFormData] = useState<profileData>({
          userName: provider.name,
          mobileNo: provider.phone,
          image: null,
     });

     const [preview, setPreview] = useState<string>("");

     useEffect(() => {
          if (provider.id) {
               getProviderData(provider.id)
                    .then((data) => {
                         setProfileData(data.data);
                    })
                    .catch((error) => {
                         console.log(error.message);
                    });
          }
     }, []);

     const validateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
          try {
               e.preventDefault();

               let isValid = true; //sets to true initially

               //checks username inputs
               if (formData.userName.trim() === "") {
                    toast.error("Name cant be empty.");
                    isValid = false;
               }

               //checks mobileNo inputs is empty
               if (formData.mobileNo.trim() === "") {
                    toast.error("Phone number cant be empty");
                    isValid = false;
               } else if (formData.mobileNo.trim().length !== 10) {
                    //checks whether it is 10 numbers long

                    toast.error("Phone number must be 10 digits.");
                    isValid = false;
               }

               if (isValid) {
                    let imageUrl = "";
                    let status = false;

                    if (formData.image) {
                         const response = await cloudinaryApi(formData.image);

                         imageUrl = response.url;
                         status = response.success;
                    }

                    if (provider.id) {
                         const updateResponse = await updateProfile({
                              ...formData,
                              url: imageUrl,
                              id: provider.id,
                         });

                         if (updateResponse.success) {
                              toast.success("Profile Updated Successfully");
                              dispatch(
                                   setProvider({
                                        id: updateResponse.data._id,
                                        name: updateResponse.data.name,
                                        email: updateResponse.data.email,
                                        phone: updateResponse.data.mobile_no,
                                        url: updateResponse.data.url,
                                        service_id: updateResponse.data.service_id,
                                   })
                              );
                              setPreview("");
                         }
                    }
               }
          } catch (error: any) {
               console.log(error.message);
          }
     };
     const handleImageUpload = () => {
          if (ref.current) {
               ref.current.click();
          }
     };

     const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
          setFormData({...formData, [e.target.id]: e.target.value});
     };

     const imageOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files && e.target.files.length > 0) {
               const file = e.target.files[0];

               // image file size and type validation
               if (file.size > 5 * 1024 * 1024) {
                    toast.error("File size must be less than 5MB.");
                    return;
               }
               if (!["image/jpeg", "image/png"].includes(file.type)) {
                    toast.error("Only JPEG and PNG files are allowed.");
                    return;
               }
               setFormData({...formData, image: file});
               setPreview(URL.createObjectURL(file));
          }
     };
     const cancelUpload = () => {
          setPreview("");
          setFormData({...formData, image: null});
          if (ref.current) {
               ref.current.value = "";
          }
     };

     return (
          <>
               {/* Main Content Section */}
               <div className="flex space-x-6 bg-customBlue p-9 me-12 rounded-xl">
                    {/* Left Block - User Profile */}

                    <div className="w-1/2 bg-white shadow p-11 rounded-xl">
                         <h2 className="text-lg font-semibold text-black mb-4">My Profile</h2>
                         <div className="flex flex-col items-center">
                              <form
                                   onSubmit={validateProfile}
                                   className="flex flex-col items-center w-full"
                              >
                                   {/* Profile Image */}
                                   <div className="relative w-full flex justify-center">
                                        {preview ? (
                                             <>
                                                  <img
                                                       src={preview}
                                                       alt="Profile"
                                                       className="w-52 h-52 rounded-full mb-8 cursor-pointer"
                                                       onClick={handleImageUpload}
                                                  />
                                                  <button
                                                       onClick={() => cancelUpload()}
                                                       className="absolute top-2 right-2 bg-brandBlue text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                                                  >
                                                       ✕
                                                  </button>
                                             </>
                                        ) : provider.url ? (
                                             <img
                                                  src={provider.url}
                                                  alt="Preview"
                                                  className="w-52 h-52 rounded-full mb-8 cursor-pointer"
                                                  onClick={handleImageUpload}
                                             />
                                        ) : (
                                             <img
                                                  src="https://firebasestorage.googleapis.com/v0/b/user-management-mern-5bc5a.appspot.com/o/profile_images%2F66fd0a2fd73f7295eaca123c?alt=media&token=00d21b9d-4a72-459d-841e-42bca581a6c8" // Placeholder image URL
                                                  alt="Default Profile"
                                                  className="w-52 h-52 rounded-full mb-8 cursor-pointer"
                                                  onClick={handleImageUpload}
                                             />
                                        )}
                                   </div>

                                   <input
                                        type="file"
                                        ref={ref}
                                        id="image"
                                        onChange={imageOnChange}
                                        className="hidden"
                                   />

                                   {/* Profile Name and Phone Number */}
                                   <div className="w-full space-y-4">
                                        <div className="text-center font-semibold text-lg">
                                             Electrician
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:space-x-4">
                                             <div className="w-full sm:w-1/2">
                                                  <input
                                                       type="text"
                                                       id="userName"
                                                       onChange={onChangeInput}
                                                       className="w-full mt-3 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                                                       value={formData.userName}
                                                  />
                                             </div>
                                             <div className="w-full sm:w-1/2">
                                                  <input
                                                       type="text"
                                                       id="mobileNo"
                                                       onChange={onChangeInput}
                                                       className="w-full mt-3 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                                                       value={formData.mobileNo}
                                                  />
                                             </div>
                                        </div>
                                        <div>
                                             <input
                                                  type="text"
                                                  className="w-full mt-3 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                                                  defaultValue={provider.email}
                                                  readOnly
                                             />
                                        </div>
                                   </div>

                                   {/* Save Button */}
                                   <div className="mt-10">
                                        <button className="px-9 py-2 bg-brandBlue text-white rounded-full hover:bg-blue-600 text-lg">
                                             Save
                                        </button>
                                   </div>
                              </form>
                         </div>
                    </div>

                    {/* Right Block - Address & Passwords */}
                    <div className="w-1/2 space-y-6">
                         {/* Address Details */}
                         <div className="bg-white shadow p-11 rounded-xl">
                              <h2 className="text-lg font-semibold text-black mt-0 mb-4">
                                   Address Details
                              </h2>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   <div>
                                        <input
                                             type="text"
                                             className="w-full mt-3 py-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                                             defaultValue="Eden Gardens"
                                             readOnly
                                        />
                                   </div>
                                   <div>
                                        <input
                                             type="text"
                                             className="w-full mt-3 py-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                                             defaultValue="Near Athena Store"
                                             readOnly
                                        />
                                   </div>
                                   <div>
                                        <input
                                             type="text"
                                             className="w-full mt-3 py-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                                             defaultValue="Thalaserry"
                                             readOnly
                                        />
                                   </div>
                                   <div>
                                        <input
                                             type="text"
                                             className="w-full mt-3 py-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                                             defaultValue="Kannur"
                                             readOnly
                                        />
                                   </div>
                                   <div>
                                        <input
                                             type="text"
                                             className="w-full mt-3 py-1  border-b-2  border-gray-300 focus:outline-none focus:border-blue-500"
                                             defaultValue="670107"
                                             readOnly
                                        />
                                   </div>
                                   <div>
                                        <input
                                             type="text"
                                             className="w-full mt-3 py-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                                             defaultValue="Kerala"
                                             readOnly
                                        />
                                   </div>
                              </div>
                         </div>

                         {/* Passwords & Security */}
                         <div className="bg-white shadow p-11 rounded-xl">
                              {!profileData?.google_id ? (
                                   <>
                                        <h2 className="text-lg font-semibold text-black mb-4">
                                             Passwords And Security
                                        </h2>
                                        <p className="text-black mb-6">
                                             For optimal security, consider updating your password
                                             periodically.
                                        </p>
                                        <button className="px-6 py-3 bg-brandBlue text-white rounded-full hover:bg-blue-600">
                                             Change Now
                                        </button>
                                   </>
                              ) : (
                                   <>
                                        <h2 className="text-lg font-semibold text-black mb-4">
                                             Signed In With Google Account
                                        </h2>
                                        <p className="text-black mb-6 leading-relaxed">
                                             You can Seamlessly sign in everytime with your gmail
                                             account.
                                        </p>
                                   </>
                              )}
                         </div>
                    </div>
               </div>
               <ToastContainer position="bottom-right" />
          </>
     );
};

export default ProviderProfile;
