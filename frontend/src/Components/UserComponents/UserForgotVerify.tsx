import React from "react";
import OtpVerifyModal from "../CommonComponents/Modals/OtpVerifyModal";
import {otpResendApi} from "../../Api/UserApis";
import {forgotOtpVerifyApi} from "../../Api/UserApis";

interface OtpVerifyProps {
     openModal: (
          type: "userSignIn" | "providerSignIn" | "userPasswordOtp" | "providerPasswordOtp"
     ) => void;
     otpOnSucess: React.Dispatch<React.SetStateAction<string | null>>;
}

const UserForgotVerify: React.FC<OtpVerifyProps> = ({openModal, otpOnSucess}) => {
     return (
          <OtpVerifyModal
               title="Forgot Password"
               onSubmit={forgotOtpVerifyApi}
               onResend={otpResendApi}
               accountType="user"
               mailType="userEmail"
               openModal={openModal}
               message="No worries! Enter your registered email below, and we'll send you instructions to reset your password."
               messageDisplay={otpOnSucess}
          />
     );
};
export default UserForgotVerify;
