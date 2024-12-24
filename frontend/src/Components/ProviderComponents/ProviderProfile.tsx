import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../Redux/Store";
import {toast, ToastContainer} from "react-toastify";
import {useRef} from "react";
import {
     getProviderData,
     updateProfile,
     getServices,
     registerProvider,
     uploadImagesToCloudinary,
} from "../../Api/ProviderApis";
import {cloudinaryApi} from "../../Api/UserApis";
import {useDispatch} from "react-redux";
import {setProvider} from "../../Redux/ProviderSlice";
import {profileData} from "../../Interfaces/ProviderInterfaces/SignInInterface";
import {IServices} from "../../Interfaces/ProviderInterfaces/SignInInterface";
import {IProviderProfile} from "../../Interfaces/ProviderInterfaces/SignInInterface";

const ProviderProfile: React.FC = () => {
     const ref = useRef<HTMLInputElement | null>(null);

     const dispatch = useDispatch();

     //state to store services
     const [services, setServices] = useState<IServices[]>([]);
     const [profileData, setProfileData] = useState<IProviderProfile>({
          provider: {
               _id: "",
               name: "",
               email: "",
               mobile_no: "",
               url: "",
               google_id: null,
               is_blocked: false,
               is_approved: false,
               is_verified: false,
          },
          service: null,
     });

     //interface for registration
     interface IRegistration {
          description: string;
          aadharImage: File | null;
          expertise: string;
          workImages: File[] | null;
     }
     const provider = useSelector((state: RootState) => state.provider);

     //edit user form data state
     const [formData, setFormData] = useState<profileData>({
          userName: provider.name,
          mobileNo: provider.phone,
          image: null,
     });

     // registration user form data
     const [registration, setRegistration] = useState<IRegistration>({
          description: "",
          expertise: "",
          aadharImage: null,
          workImages: null,
     });

     const [preview, setPreview] = useState<string>("");
     console.log(registration);
     useEffect(() => {
          if (provider.id) {
               //calls api to get lookup data of the provider
               getProviderData(provider.id)
                    .then((data) => {
                         setProfileData(data.data);
                    })
                    .catch((error) => {
                         console.log(error.message);
                    });
          }
     }, []);

     useEffect(() => {
          if (provider.id) {
               //calls api to get all services
               getServices()
                    .then((data) => {
                         setServices(data.services);
                    })
                    .catch((error) => {
                         console.log(error.message);
                    });
          }
     }, []);

     // Handle Expertise Change
     const handleExpertiseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
          setRegistration((prev) => ({...prev, expertise: e.target.value}));
     };

     // Handle Aadhaar Image Change
     const handleAadharImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files && e.target.files.length > 0) {
               const file = e.target.files[0];
               if (file.size > 5 * 1024 * 1024) {
                    toast.error("Aadhaar file size must be less than 5MB.");
                    return;
               }
               if (!["image/jpeg", "image/png"].includes(file.type)) {
                    toast.error("Only JPEG and PNG files are allowed for Aadhaar.");
                    return;
               }
               setRegistration((prev) => ({...prev, aadharImage: file}));
          }
     };

     // Handle Work Images Change
     const handleWorkImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files) {
               const files = Array.from(e.target.files);
               if (files.length > 2) {
                    toast.error("You can upload a maximum of 2 work images.");
                    return;
               }
               for (let file of files) {
                    if (file.size > 5 * 1024 * 1024) {
                         toast.error("Each work image must be less than 5MB.");
                         return;
                    }
                    if (!["image/jpeg", "image/png"].includes(file.type)) {
                         toast.error("Only JPEG and PNG files are allowed for work images.");
                         return;
                    }
               }
               setRegistration((prev) => ({...prev, workImages: files}));
          }
     };

     // Validate Registration Form
     const validateRegistrationForm = async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const {description, expertise, aadharImage, workImages} = registration;

          if (!description.trim()) {
               toast.error("Experience description is required.");
               return;
          }
          if (!profileData.service?.name) {
               if (!expertise) {
                    toast.error("Please select your area of expertise.");
                    return;
               }
          }

          if (!aadharImage) {
               toast.error("Aadhaar image is required.");
               return;
          }
          if (!workImages || workImages.length === 0) {
               toast.error("Two work images are required.");
               return;
          }
          let aadharUpload = null;
          let workImageUrls = null;

          // Upload Aadhaar Image
          if (registration.aadharImage) {
               aadharUpload = await cloudinaryApi(registration.aadharImage);
          }
          // Upload Work Images
          if (registration.workImages) {
               workImageUrls = await uploadImagesToCloudinary(registration.workImages);
          }

          // api register providers by sending requests to admin
          if (provider.id) {
               const response = await registerProvider(
                    provider.id,
                    aadharUpload?.url,
                    workImageUrls,
                    registration.description,
                    registration.expertise
               );
               if (response.success === true) {
                    toast.success("Approval request sent successfully");
               } else {
                    toast.error(response.message);
               }
          }
     };

     //validate edit profile form
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
                              {!profileData?.provider.google_id ? (
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
               {!profileData.provider.is_approved && (
                    <div className="flex space-x-6 bg-customBlue p-9 mt-4 me-12 rounded-xl">
                         <div className="w-full bg-white shadow p-11 rounded-xl">
                              <h2 className="text-2xl font-semibold mt-6 text-black mb-6 text-center">
                                   Provider Registration - Complete Your Profile
                              </h2>
                              <p className="text-gray-600 text-start mb-8">
                                   Ensure your details are accurate to start receiving job
                                   opportunities and enhance your credibility with clients.
                              </p>
                              <form onSubmit={validateRegistrationForm}>
                                   <div className="grid grid-cols-1 gap-8">
                                        {/* Experience Description */}
                                        <div className="mt-6">
                                             <label
                                                  htmlFor="experience"
                                                  className="block text-gray-700 text-sm font-semibold mb-2"
                                             >
                                                  Experience Description
                                             </label>
                                             <textarea
                                                  id="experience"
                                                  rows={3}
                                                  className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                  placeholder="Briefly describe your professional experience..."
                                                  value={registration.description}
                                                  onChange={(e) =>
                                                       setRegistration((prev) => ({
                                                            ...prev,
                                                            description: e.target.value,
                                                       }))
                                                  }
                                             ></textarea>
                                        </div>

                                        {/* Expertise Select Box */}
                                        {!profileData.service?.name && (
                                             <div>
                                                  <label
                                                       htmlFor="expertise"
                                                       className="block text-gray-700 text-sm font-semibold mb-2"
                                                  >
                                                       Area of Expertise
                                                  </label>
                                                  <select
                                                       id="expertise"
                                                       className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                       value={registration.expertise}
                                                       onChange={handleExpertiseChange}
                                                  >
                                                       <option value="">
                                                            Select your expertise
                                                       </option>
                                                       {services.length &&
                                                            services.map((each, index) => (
                                                                 <option
                                                                      value={each._id}
                                                                      key={index}
                                                                 >
                                                                      {each.name}
                                                                 </option>
                                                            ))}
                                                  </select>
                                             </div>
                                        )}

                                        {/* Aadhaar Card and Work Images Upload */}
                                        <div className="flex justify-between items-start my-6 space-x-4">
                                             <div className="w-1/2">
                                                  <label
                                                       htmlFor="aadhaar"
                                                       className="block text-gray-700 text-sm font-semibold mb-2"
                                                  >
                                                       Aadhaar Card (Front Image)
                                                  </label>
                                                  <input
                                                       type="file"
                                                       id="aadhaar"
                                                       accept="image/*"
                                                       className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brandBlue file:text-white hover:file:bg-blue-600 focus:outline-none"
                                                       onChange={handleAadharImageChange}
                                                  />
                                                  <p className="text-xs text-gray-500 mt-2">
                                                       Upload a clear image of the front side of
                                                       your Aadhaar card.
                                                  </p>
                                             </div>
                                             <div className="w-1/2">
                                                  <label
                                                       htmlFor="sampleWork"
                                                       className="block text-gray-700 text-sm font-semibold mb-2"
                                                  >
                                                       Sample Work (Image Upload)
                                                  </label>
                                                  <input
                                                       type="file"
                                                       id="sampleWork"
                                                       accept="image/*"
                                                       className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brandBlue file:text-white hover:file:bg-blue-600 focus:outline-none"
                                                       onChange={handleWorkImagesChange}
                                                       multiple
                                                  />
                                                  <p className="text-xs text-gray-500 mt-2">
                                                       Share up to 2 images of your previous work to
                                                       showcase your skills.
                                                  </p>
                                             </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex justify-center my-3">
                                             <button
                                                  type="submit"
                                                  className="px-9 py-2 bg-brandBlue text-white rounded-full hover:bg-blue-600 text-lg"
                                             >
                                                  Complete Registration
                                             </button>
                                        </div>
                                   </div>
                              </form>
                         </div>
                    </div>
               )}
          </>
     );
};

export default ProviderProfile;
