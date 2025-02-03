import React from "react";
import { toast } from "react-toastify";
import { useState } from "react";

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
    messageDisplay: React.Dispatch<React.SetStateAction<string>>;
    submitPassword: (id: string, data: string) => Promise<IResponse>;
    accountType: string;
    openModal: (type: "userSignIn" | "providerSignIn") => void;
}
const ResetPasswordModal: React.FC<IResetPasswordProps> = ({
    title,
    messageDisplay,
    submitPassword,
    accountType,
    openModal,
}) => {
    // state to store the passwords
    const [formData, setFormData] = useState<IResetPassword>({
        password: "",
        confirmPassword: "",
    });
    console.log("reset password modal");
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
            let emailType = "providerEmail";
            if (accountType === "user") {
                emailType = "userEmail";
            }
            if (isValid) {
                const email = localStorage.getItem(emailType) || "";
                const response = await submitPassword(email, formData.password); // calls backend api with email and password
                if (response.success === true) {
                    console.log(response);
                    messageDisplay("Please Sign In with the new password");
                    if (accountType === "user") {
                        openModal("userSignIn");
                    } else {
                        openModal("providerSignIn");
                    }
                } else {
                    toast.error(response.message);
                }
            }
        } catch (error: any) {
            console.log(error.message);
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60"
            onClick={() => {
                //    props.closeModal();
            }}
        >
            <div
                className="bg-white pt-8 pb-14 px-10  rounded-lg shadow-lg w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-4xl font-semibold mb-12 text-center text-gray-900">{title}</h2>

                <form className="space-y-7" onSubmit={validateForm}>
                    <div>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter New Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-500    rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-brandBlue text-white text-lg font-semibold rounded-lg hover:bg-brandBlue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Confirm Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordModal;
