import React, { useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/Store";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LoadingSpinner from "../LoadingSpinner";

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

    // password show hide
    const [inputType, setInputType] = useState<{ password: boolean; passwordConfirm: boolean }>({
        password: false,
        passwordConfirm: false,
    });
    const [loading, setLoading] = useState<boolean>(false);
    // Form data input updation
    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    }
    //show and hide passwords

    const toggleEyeButton = (input: "password" | "passwordConfirm") => {
        setInputType((prev) => ({
            ...prev,
            [input]: !prev[input],
        }));
    };
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
            setLoading(true);
            const response = await verifyPassword(id, formData.currentPassword); // Call the API to verify the current password
            if (response.success === true) {
                setModal("newPassword");
            } else {
                toast.error(response.message);
            }
            setLoading(false);
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
                <h2 className="text-3xl font-semibold mb-12 text-center text-gray-900">{title}</h2>

                <form className="space-y-7" onSubmit={validateForm}>
                    <div className="relative w-full ">
                        <input
                            type={inputType.password ? "text" : "password"}
                            id="currentPassword"
                            placeholder="Current Password"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        />{" "}
                        <span
                            onClick={() => toggleEyeButton("password")}
                            className="absolute inset-y-0 right-6 flex items-center cursor-pointer"
                        >
                            {inputType.password ? <FaEye /> : <FaEyeSlash />}
                        </span>
                    </div>
                    <div className="relative w-full ">
                        <input
                            type={inputType.passwordConfirm ? "text" : "password"}
                            id="confirmCurrentPassword"
                            placeholder="Confirm Current Password"
                            value={formData.confirmCurrentPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        />
                        <span
                            onClick={() => toggleEyeButton("passwordConfirm")}
                            className="absolute inset-y-0 right-6 flex items-center cursor-pointer"
                        >
                            {inputType.passwordConfirm ? <FaEye /> : <FaEyeSlash />}
                        </span>
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-3 bg-brandBlue text-white text-lg font-semibold rounded-lg hover:bg-brandBlue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            loading
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-brandBlue hover:bg-blue-700"
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
