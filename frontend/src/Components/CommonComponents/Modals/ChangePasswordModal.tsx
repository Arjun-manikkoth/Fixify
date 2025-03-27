// src/components/CommonComponents/Modals/ChangePasswordModal.tsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/Store";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LoadingSpinner from "../LoadingSpinner";

interface IChangePassword {
    currentPassword: string;
    confirmCurrentPassword: string;
}

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

    const [formData, setFormData] = useState<IChangePassword>({
        currentPassword: "",
        confirmCurrentPassword: "",
    });
    const [inputType, setInputType] = useState<{ password: boolean; passwordConfirm: boolean }>({
        password: false,
        passwordConfirm: false,
    });
    const [loading, setLoading] = useState<boolean>(false);

    const toggleEyeButton = (input: "password" | "passwordConfirm") => {
        setInputType((prev) => ({
            ...prev,
            [input]: !prev[input],
        }));
    };

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    }

    const validateForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let isValid = true;

        if (formData.currentPassword.trim().length === 0) {
            toast.error("Please enter your current password.");
            isValid = false;
        } else if (formData.confirmCurrentPassword.trim() === "") {
            toast.error("Please confirm your current password.");
            isValid = false;
        } else if (formData.currentPassword.trim() !== formData.confirmCurrentPassword.trim()) {
            toast.error("Current passwords don't match.");
            isValid = false;
        }

        const id = role === "user" ? user.id : provider.id;

        if (isValid) {
            setLoading(true);
            try {
                const response = await verifyPassword(id, formData.currentPassword);
                if (response.success) {
                    setModal("newPassword");
                } else {
                    toast.error(response.message || "Failed to verify password.");
                }
            } catch (error: any) {
                toast.error(error.message || "An error occurred.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
            onClick={() => setModal("")}
        >
            <div
                className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-center text-gray-800">
                    {title}
                </h2>

                <form className="space-y-5 sm:space-y-6" onSubmit={validateForm}>
                    <div className="relative">
                        <input
                            type={inputType.password ? "text" : "password"}
                            id="currentPassword"
                            placeholder="Current Password"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            disabled={loading}
                        />
                        <span
                            onClick={() => toggleEyeButton("password")}
                            className="absolute inset-y-0 right-3 sm:right-4 flex items-center cursor-pointer text-gray-500"
                        >
                            {inputType.password ? <FaEye /> : <FaEyeSlash />}
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type={inputType.passwordConfirm ? "text" : "password"}
                            id="confirmCurrentPassword"
                            placeholder="Confirm Current Password"
                            value={formData.confirmCurrentPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            disabled={loading}
                        />
                        <span
                            onClick={() => toggleEyeButton("passwordConfirm")}
                            className="absolute inset-y-0 right-3 sm:right-4 flex items-center cursor-pointer text-gray-500"
                        >
                            {inputType.passwordConfirm ? <FaEye /> : <FaEyeSlash />}
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full px-4 py-2 sm:px-6 sm:py-3 bg-brandBlue text-white text-sm sm:text-base font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            loading ? "bg-gray-400 cursor-not-allowed" : "hover:bg-blue-700"
                        }`}
                    >
                        {loading ? <LoadingSpinner /> : "Change Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
