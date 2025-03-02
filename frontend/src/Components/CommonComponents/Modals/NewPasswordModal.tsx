import React from "react";
import { toast } from "react-toastify";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../Redux/Store";
import { clearUser } from "../../../Redux/UserSlice";
import { clearProvider } from "../../../Redux/ProviderSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LoadingSpinner from "../LoadingSpinner";

//reset password form state interface
interface IResetPassword {
    password: string;
    confirmPassword: string;
}

//api response interface
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

    // state to store the passwords
    const [formData, setFormData] = useState<IResetPassword>({
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState<boolean>(false);

    // password show hide
    const [inputType, setInputType] = useState<{ password: boolean; passwordConfirm: boolean }>({
        password: false,
        passwordConfirm: false,
    });

    const dispatch = useDispatch();

    //show and hide passwords

    const toggleEyeButton = (input: "password" | "passwordConfirm") => {
        setInputType((prev) => ({
            ...prev,
            [input]: !prev[input],
        }));
    };

    //form data input updation
    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    }

    //validate password input which specifies one capital letter one number and one special character
    function validatePassword(password: string): boolean {
        let regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;
        return regex.test(password);
    }

    //input validation
    const validateForm = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault(); //prevents default form submission event

            let isValid = true;

            //check password input is empty
            if (formData.password.trim().length < 8) {
                toast.error("Password must be at least 8 characters long.");
                isValid = false;
            } else {
                //validates password aligns with the given format

                if (!validatePassword(formData.password.trim())) {
                    toast.error(
                        "Password must contain at least one uppercase letter, one number, and one special character."
                    );
                    isValid = false;
                } else {
                    //checks confirm password field is empty
                    if (formData.confirmPassword.trim() === "") {
                        toast.error("Please Re-enter password ");
                        isValid = false;
                    } else if (formData.password.trim() !== formData.confirmPassword) {
                        //sends toast error if the passwords didnt match

                        toast.error("Passwords doesnt match");
                        isValid = false;
                    }
                }
            }

            if (isValid) {
                let email = role === "user" ? user.email : provider.email;
                setLoading(true);
                const response = await submitPassword(email, formData.password); // calls backend api with email and password
                if (response.success === true) {
                    toast.success("Password Changed successfully,Kindly login with new password");
                    setTimeout(async () => {
                        const logoutStatus = await logout();
                        if (logoutStatus.success) {
                            role === "user" ? dispatch(clearUser()) : dispatch(clearProvider());
                        }
                    }, 3000);
                } else {
                    toast.error(response.message);
                }
                setLoading(false);
            }
        } catch (error: any) {
            console.log(error.message);
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
                className="bg-white pt-8 pb-14 px-10  rounded-lg shadow-lg w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-3xl font-semibold mb-12 text-center text-gray-900">{title}</h2>

                <form className="space-y-7" onSubmit={validateForm}>
                    <div className="relative w-full ">
                        <input
                            type={inputType.password ? "text" : "password"}
                            id="password"
                            placeholder="Enter New Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-500    rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        />
                        <span
                            onClick={() => toggleEyeButton("password")}
                            className="absolute inset-y-0 right-6 flex items-center cursor-pointer"
                        >
                            {inputType.password ? <FaEye /> : <FaEyeSlash />}
                        </span>
                    </div>
                    <div className="relative w-full">
                        <input
                            type={inputType.passwordConfirm ? "text" : "password"}
                            id="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
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
                        {loading ? <LoadingSpinner /> : "Confirm Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewPasswordModal;
