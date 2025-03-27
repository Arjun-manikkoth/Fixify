// src/components/UserComponents/UserProfile.tsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../Redux/Store";
import { toast } from "react-toastify";
import { useRef } from "react";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import { getUserData, updateProfile } from "../../Api/UserApis";
import { setUser } from "../../Redux/UserSlice";
import { profileData, User } from "../../Interfaces/UserInterfaces/SignInInterface";
import ChangePasswordModalUser from "./UserChangePassword";
import UserResetPassword from "./UserPasswordReset";

const UserProfile: React.FC = () => {
    const ref = useRef<HTMLInputElement | null>(null);
    const dispatch = useDispatch();

    const [modalType, setModal] = useState<"changePassword" | "newPassword" | "">("");
    const [loading, setLoading] = useState<boolean>(false);
    const [profileData, setProfileData] = useState<User>({
        _id: "",
        name: "",
        email: "",
        mobile_no: "",
        url: "",
        address_id: "",
        chosen_address_id: "",
        is_verified: null,
        is_blocked: null,
        is_deleted: null,
        google_id: null,
    });

    const user = useSelector((state: RootState) => state.user);

    const [formData, setFormData] = useState<profileData>({
        userName: user.name,
        mobileNo: user.phone,
        image: null,
    });

    const [preview, setPreview] = useState<string>("");

    useEffect(() => {
        if (user.id) {
            setLoading(true);
            getUserData(user.id)
                .then((data) => {
                    setProfileData(data.data);
                    setFormData({
                        userName: data.data.name,
                        mobileNo: data.data.mobile_no,
                        image: null,
                    });
                })
                .catch((error) => {
                    console.log(error.message);
                })
                .finally(() => setLoading(false));
        }
    }, [user.id]);

    const validateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            let isValid = true;

            if (formData.userName.trim() === "") {
                toast.error("Name can't be empty.");
                isValid = false;
            }

            if (formData.mobileNo.trim() === "") {
                toast.error("Phone number can't be empty");
                isValid = false;
            } else if (formData.mobileNo.trim().length !== 10) {
                toast.error("Phone number must be 10 digits.");
                isValid = false;
            }

            if (isValid && user.id) {
                setLoading(true);
                const updateResponse = await updateProfile({
                    ...formData,
                    id: user.id,
                });

                if (updateResponse.success) {
                    toast.success("Profile Updated Successfully");
                    dispatch(
                        setUser({
                            id: updateResponse.data._id,
                            name: updateResponse.data.name,
                            email: updateResponse.data.email,
                            phone: updateResponse.data.mobile_no,
                            url: updateResponse.data.url,
                        })
                    );
                    setPreview("");
                }
                setLoading(false);
            }
        } catch (error: any) {
            console.log(error.message);
            setLoading(false);
        }
    };

    const handleImageUpload = () => {
        ref.current?.click();
    };

    const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

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
                <div className="flex flex-col space-y-6">
                    {/* Profile Section */}
                    <div className="w-full bg-white shadow-lg rounded-xl p-6 sm:p-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">My Profile</h2>
                        {loading ? (
                            <div className="flex justify-center">
                                <LoadingSpinner />
                            </div>
                        ) : (
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
                                                className="absolute top-0 right-1/3 sm:right-1/4 bg-brandBlue text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                                            >
                                                ✕
                                            </button>
                                        </>
                                    ) : user.url ? (
                                        <img
                                            src={user.url}
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
                                    accept="image/*"
                                    ref={ref}
                                    id="image"
                                    onChange={imageOnChange}
                                    className="hidden"
                                />

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
                                            defaultValue={user.email}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-center mt-6">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 sm:px-9 sm:py-3 bg-brandBlue text-white rounded-full hover:bg-blue-600 text-base sm:text-lg"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Password Section */}
                    <div className="w-full bg-white shadow-lg rounded-xl p-6 sm:p-8">
                        {!profileData?.google_id ? (
                            <>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    Passwords And Security
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    For optimal security, consider updating your password
                                    periodically.
                                </p>
                                <button
                                    className="px-6 py-2 sm:px-8 sm:py-3 bg-brandBlue text-white rounded-full hover:bg-blue-600 text-base sm:text-lg"
                                    onClick={() => setModal("changePassword")}
                                >
                                    Change Now
                                </button>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    Signed In With Google Account
                                </h2>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    You can seamlessly sign in every time with your Gmail account.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {modalType === "changePassword" && <ChangePasswordModalUser setModal={setModal} />}
            {modalType === "newPassword" && <UserResetPassword setModal={setModal} />}
        </div>
    );
};

export default UserProfile;
