// src/components/ProviderComponents/ProviderProfile.tsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/Store";
import { toast } from "react-toastify";
import { useRef } from "react";
import {
    getProviderData,
    updateProfile,
    getServices,
    registerProvider,
} from "../../Api/ProviderApis";
import { useDispatch } from "react-redux";
import { setProvider } from "../../Redux/ProviderSlice";
import { profileData } from "../../Interfaces/ProviderInterfaces/SignInInterface";
import { IServices } from "../../Interfaces/ProviderInterfaces/SignInInterface";
import { IProviderProfile } from "../../Interfaces/ProviderInterfaces/SignInInterface";
import ChangePasswordModalProvider from "./ProviderChangePassword";
import ProviderResetPassword from "./ProviderResetPassword";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";

const ProviderProfile: React.FC = () => {
    const ref = useRef<HTMLInputElement | null>(null);
    const dispatch = useDispatch();

    const [modalType, setModal] = useState<"changePassword" | "newPassword" | "">("");
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingRegister, setLoadingRegister] = useState<boolean>(false);
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

    interface IRegistration {
        description: string;
        aadharImage: File | null;
        expertise_id: string;
        workImages: File[];
    }

    const provider = useSelector((state: RootState) => state.provider);
    const [formData, setFormData] = useState<profileData>({
        userName: provider.name,
        mobileNo: provider.phone,
        image: null,
    });
    const [registration, setRegistration] = useState<IRegistration>({
        description: "",
        expertise_id: "",
        aadharImage: null,
        workImages: [],
    });
    const [preview, setPreview] = useState<string>("");

    useEffect(() => {
        if (provider.id) {
            setLoading(true);
            getProviderData(provider.id)
                .then((data) => setProfileData(data.data))
                .catch((error) => console.log(error.message))
                .finally(() => setLoading(false));
        }
    }, [provider.id]);

    useEffect(() => {
        if (provider.id) {
            setLoading(true);
            getServices()
                .then((response) => setServices(response.data))
                .catch((error) => console.log(error.message))
                .finally(() => setLoading(false));
        }
    }, [provider.id]);

    const handleExpertiseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRegistration((prev) => ({ ...prev, expertise_id: e.target.value }));
    };

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
            setRegistration((prev) => ({ ...prev, aadharImage: file }));
        }
    };

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
            setRegistration((prev) => ({ ...prev, workImages: files }));
        }
    };

    const validateRegistrationForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { description, expertise_id, aadharImage, workImages } = registration;

        if (!description.trim()) {
            toast.error("Experience description is required.");
            return;
        }
        if (!profileData.service?.name && !expertise_id) {
            toast.error("Please select your area of expertise.");
            return;
        }
        if (!aadharImage) {
            toast.error("Aadhaar image is required.");
            return;
        }
        if (!workImages || workImages.length === 0) {
            toast.error("Two work images are required.");
            return;
        }

        setLoadingRegister(true);
        try {
            if (provider.id) {
                const response = await registerProvider(
                    provider.id,
                    aadharImage,
                    workImages,
                    description,
                    expertise_id
                );
                if (response.success) {
                    toast.success("Approval request sent successfully");
                } else {
                    toast.error(response.message);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingRegister(false);
        }
    };

    const validateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.userName.trim() === "") {
            toast.error("Name can't be empty.");
            return;
        }
        if (formData.mobileNo.trim() === "" || formData.mobileNo.trim().length !== 10) {
            toast.error(
                formData.mobileNo.trim() === ""
                    ? "Phone number can't be empty"
                    : "Phone number must be 10 digits."
            );
            return;
        }

        setLoading(true);
        try {
            if (provider.id) {
                const updateResponse = await updateProfile({
                    ...formData,
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
        } catch (error: any) {
            console.log(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = () => ref.current?.click();
    const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData({ ...formData, [e.target.id]: e.target.value });

    const imageOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB.");
                return;
            }
            if (!["image/jpeg", "image/png"].includes(file.type)) {
                toast.error("Only JPEG and PNG files are allowed.");
                return;
            }
            setFormData({ ...formData, image: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const cancelUpload = () => {
        setPreview("");
        setFormData({ ...formData, image: null });
        if (ref.current) ref.current.value = "";
    };

    return (
        <div className="pt-16 md:pl-72 bg-gray-100 min-h-screen flex-1">
            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="flex flex-col space-y-6">
                        {/* Profile Section */}
                        <div className="w-full bg-white shadow-lg rounded-xl p-6 sm:p-8">
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                                My Profile
                            </h2>
                            <form onSubmit={validateProfile} className="space-y-6">
                                <div className="flex justify-center relative">
                                    {preview ? (
                                        <>
                                            <img
                                                src={preview}
                                                alt="Profile Preview"
                                                className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-full mb-4 cursor-pointer object-cover"
                                                onClick={handleImageUpload}
                                            />
                                            <button
                                                onClick={cancelUpload}
                                                className="absolute top-0 right-1/3 sm:right-1/4 bg-brandBlue text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-blue-600 transition"
                                            >
                                                ✕
                                            </button>
                                        </>
                                    ) : provider.url ? (
                                        <img
                                            src={provider.url}
                                            alt="Profile"
                                            referrerPolicy="no-referrer"
                                            className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-full mb-4 cursor-pointer object-cover"
                                            onClick={handleImageUpload}
                                        />
                                    ) : (
                                        <img
                                            src="https://firebasestorage.googleapis.com/v0/b/user-management-mern-5bc5a.appspot.com/o/profile_images%2F66fd0a2fd73f7295eaca123c?alt=media&token=00d21b9d-4a72-459d-841e-42bca581a6c8"
                                            alt="Default Profile"
                                            className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-full mb-4 cursor-pointer object-cover"
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
                                />{" "}
                                <div className="sm:col-span-2 text-center">
                                    <span
                                        className={`text-sm sm:text-lg ${
                                            profileData?.service
                                                ? "font-semibold text-blue-600"
                                                : "text-red-700"
                                        }`}
                                    >
                                        {profileData?.service?.name || "Service not chosen"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="userName"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="userName"
                                            onChange={onChangeInput}
                                            className="w-full mt-1 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
                                            value={formData.userName}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="mobileNo"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            id="mobileNo"
                                            onChange={onChangeInput}
                                            className="w-full mt-1 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
                                            value={formData.mobileNo}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Email
                                        </label>
                                        <input
                                            type="text"
                                            id="email"
                                            className="w-full mt-1 py-2 border-b-2 border-gray-300 focus:outline-none bg-transparent text-gray-500"
                                            defaultValue={provider.email}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-center mt-6">
                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className={`px-6 py-2 sm:px-9 sm:py-3 bg-brandBlue text-white rounded-full hover:bg-blue-600 text-base sm:text-lg  transition ${
                                            loading ? "bg-gray-500 cursor-not-allowed" : ""
                                        }`}
                                    >
                                        {loading ? <LoadingSpinner /> : "Save"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Password Section */}
                        <div className="w-full bg-white shadow-lg rounded-xl p-6 sm:p-8">
                            {!profileData?.provider.google_id ? (
                                <>
                                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                                        Passwords And Security
                                    </h2>
                                    <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                                        For optimal security, consider updating your password
                                        periodically.
                                    </p>
                                    <div className="flex justify-start">
                                        <button
                                            className="px-6 py-2 sm:px-8 sm:py-3 bg-brandBlue text-white rounded-full hover:bg-blue-600 text-base sm:text-lg  transition"
                                            onClick={() => setModal("changePassword")}
                                        >
                                            Change Now
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                                        Signed In With Google Account
                                    </h2>
                                    <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                                        You can seamlessly sign in every time with your Gmail
                                        account.
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Registration Section */}
                        {!profileData.provider.is_approved && (
                            <div className="w-full bg-white shadow-lg rounded-xl p-6 sm:p-8">
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">
                                    Provider Registration - Complete Your Profile
                                </h2>
                                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 text-center">
                                    Ensure your details are accurate to start receiving job
                                    opportunities and enhance your credibility with clients.
                                </p>
                                <form onSubmit={validateRegistrationForm} className="space-y-6">
                                    {/* Experience Description */}
                                    <div>
                                        <label
                                            htmlFor="experience"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Experience Description
                                        </label>
                                        <textarea
                                            id="experience"
                                            rows={3}
                                            className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Briefly describe your professional experience..."
                                            value={registration.description}
                                            onChange={(e) =>
                                                setRegistration((prev) => ({
                                                    ...prev,
                                                    description: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    {/* Expertise Select */}
                                    {!profileData.service?.name && (
                                        <div>
                                            <label
                                                htmlFor="expertise"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Area of Expertise
                                            </label>
                                            <select
                                                id="expertise"
                                                className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={registration.expertise_id}
                                                onChange={handleExpertiseChange}
                                            >
                                                <option value="">Select your expertise</option>
                                                {services.map((each, index) => (
                                                    <option value={each._id} key={index}>
                                                        {each.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* File Uploads */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                htmlFor="aadhaar"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Aadhaar Card (Front Image)
                                            </label>
                                            <input
                                                type="file"
                                                id="aadhaar"
                                                accept="image/*"
                                                className="block w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brandBlue file:text-white hover:file:bg-blue-600 focus:outline-none"
                                                onChange={handleAadharImageChange}
                                            />
                                            <p className="text-xs text-gray-500 mt-2">
                                                Upload a clear image of the front side of your
                                                Aadhaar card.
                                            </p>
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="sampleWork"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Sample Work (Image Upload)
                                            </label>
                                            <input
                                                type="file"
                                                id="sampleWork"
                                                accept="image/*"
                                                className="block w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brandBlue file:text-white hover:file:bg-blue-600 focus:outline-none"
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
                                    <div className="flex justify-center mt-6">
                                        <button
                                            disabled={loadingRegister}
                                            type="submit"
                                            className={`px-6 py-2 sm:px-9 sm:py-3 bg-brandBlue text-white rounded-full hover:bg-blue-600 text-base sm:text-lg font-semibold transition ${
                                                loadingRegister
                                                    ? "bg-gray-500 cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            {loadingRegister ? (
                                                <LoadingSpinner />
                                            ) : (
                                                "Complete Registration"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {modalType === "changePassword" && <ChangePasswordModalProvider setModal={setModal} />}
            {modalType === "newPassword" && <ProviderResetPassword setModal={setModal} />}
        </div>
    );
};

export default ProviderProfile;
