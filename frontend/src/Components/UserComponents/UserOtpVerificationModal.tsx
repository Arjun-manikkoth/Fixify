import React from "react";
import {otpVerifyApi} from "../../Api/UserApis";
import {otpResendApi} from "../../Api/UserApis";
import OtpVerifyModal from "../CommonComponents/Modals/OtpVerifyModal";

interface OtpVerifyProps {
     openModal: (type: "userSignIn" | "providerSignIn") => void;
     otpOnSucess: React.Dispatch<React.SetStateAction<string | null>>;
}

const UserOtpVerificationModal: React.FC<OtpVerifyProps> = ({openModal, otpOnSucess}) => {
     return (
          <>
               <OtpVerifyModal
                    title="Verify Account"
                    onSubmit={otpVerifyApi}
                    onResend={otpResendApi}
                    accountType="user"
                    mailType="userEmail"
                    openModal={openModal}
                    message="We’ve sent a one-time password (OTP) to your registered email. Enter the  code here to verify your account."
                    messageDisplay={otpOnSucess}
               />
          </>
     );
};

export default UserOtpVerificationModal;
