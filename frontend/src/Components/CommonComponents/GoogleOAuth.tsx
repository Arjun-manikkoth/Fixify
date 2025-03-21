import React from "react";
import { useGoogleLogin, CodeResponse } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { googleAuthApi } from "../../Api/UserApis";
import { googleAuthApi as providerAuthApi } from "../../Api/ProviderApis";
import { setUser } from "../../Redux/UserSlice";
import { setProvider } from "../../Redux/ProviderSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useContext } from "react";
import { ModalContext } from "./Header";

const GoogleOAuth: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const modal = useContext(ModalContext);

    const responseGoogle = async (
        authResult: Omit<CodeResponse, "error" | "error_description" | "error_uri">
    ): Promise<void> => {
        try {
            if (modal === "userSignIn" || modal === "userSignUp") {
                if (authResult.code) {
                    // Uncomment and adjust as needed
                    const result = await googleAuthApi(authResult.code);
                    if (result?.success === true) {
                        dispatch(
                            setUser({
                                email: result.data.email,
                                id: result.data.id,
                                name: result.data.name,
                                phone: result.data.phone,
                                url: result.data.url,
                            })
                        );

                        navigate("/users/profile");
                    } else {
                        toast.error(result.message);
                    }
                } else {
                    console.error("Unexpected response:", authResult);
                    throw new Error("Unexpected Google login response.");
                }
            } else if (modal === "providerSignIn" || "providerSignUp") {
                if (authResult.code) {
                    // Uncomment and adjust as needed
                    const result = await providerAuthApi(authResult.code);

                    if (result?.success === true) {
                        dispatch(
                            setProvider({
                                id: result.data.id,
                                service_id: null,
                                name: result.data.name,
                                email: result.data.email,
                                phone: result.data.phone,
                                url: result.data.url,
                            })
                        );

                        navigate("/providers/profile");
                    } else {
                        toast.error(result.message);
                    }
                } else {
                    console.error("Unexpected response:", authResult);
                    throw new Error("Unexpected Google login response.");
                }
            }
        } catch (error) {
            console.error("Error during Google login:", error);
            toast.error("Cannot sign up at this moment");
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: responseGoogle,
        onError: (error) => {
            console.error("Error during Google login:", error);
        },
        flow: "auth-code",
    });

    return (
        <button
            type="button"
            className="flex items-center w-full py-3 px-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={googleLogin}
        >
            <FcGoogle className="h-6 w-6 mr-5 ml-2" />

            {modal === "providerSignIn" || modal === "userSignIn" ? (
                <span className="text-gray-600 text-base font-medium">Continue with Google</span>
            ) : (
                <span className="text-gray-600 text-base font-medium">
                    Sign Up with Google Account
                </span>
            )}
        </button>
    );
};

export default GoogleOAuth;
