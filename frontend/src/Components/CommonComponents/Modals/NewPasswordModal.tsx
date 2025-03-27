// src/components/CommonComponents/Modals/NewPasswordModal.tsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../Redux/Store";
import { clearUser } from "../../../Redux/UserSlice";
import { clearProvider } from "../../../Redux/ProviderSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LoadingSpinner from "../LoadingSpinner";

interface IResetPassword {
    password: string;
    confirmPassword: string;
}

interface IResponse {
    success: boolean;
    message: string;
    data: any;
}

interface IResetPasswordProps {
    title: string;
    submitPassword: (id: string, data: string) => Promise<IResponse>;
    setModal: (type: "") => void;
    role: "user" | "provider";
    logout: () => Promise<IResponse>;
}

const NewPasswordModal: React.FC<IResetPasswordProps> = ({
    title,
    submitPassword,
    setModal,
    role,
    logout,
}) => {
    const user = useSelector((state: RootState) => state.user);
    const provider = useSelector((state: RootState) => state.provider);
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IResetPassword>({
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [inputType, setInputType] = useState<{ password: boolean; passwordConfirm: boolean }>({
        password: false,
        passwordConfirm: false,
    });

    const toggleEyeButton = (input: "password" | "passwordConfirm") => {
        setInputType((prev) => ({
            ...prev,
            [input]: !prev[input],
        }));
    };

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    }

    function validatePassword(password: string): boolean {
        let regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;
        return regex.test(password);
    }

    const validateForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let isValid = true;

        if (formData.password.trim().length < 8) {
            toast.error("Password must be at least 8 characters long.");
            isValid = false;
        } else if (!validatePassword(formData.password.trim())) {
            toast.error(
                "Password must contain at least one uppercase letter, one number, and one special character."
            );
            isValid = false;
        } else if (formData.confirmPassword.trim() === "") {
            toast.error("Please re-enter password.");
            isValid = false;
        } else if (formData.password.trim() !== formData.confirmPassword.trim()) {
            toast.error("Passwords don't match.");
            isValid = false;
        }

        if (isValid) {
            const email = role === "user" ? user.email : provider.email;
            setLoading(true);
            try {
                const response = await submitPassword(email, formData.password);
                if (response.success) {
                    toast.success(
                        "Password changed successfully. Please log in with the new password."
                    );
                    setTimeout(async () => {
                        const logoutStatus = await logout();
                        if (logoutStatus.success) {
                            role === "user" ? dispatch(clearUser()) : dispatch(clearProvider());
                            setModal("");
                        }
                    }, 2000);
                } else {
                    toast.error(response.message || "Failed to change password.");
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
                            id="password"
                            placeholder="Enter New Password"
                            value={formData.password}
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
                            id="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
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
                        {loading ? <LoadingSpinner /> : "Confirm Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewPasswordModal;
