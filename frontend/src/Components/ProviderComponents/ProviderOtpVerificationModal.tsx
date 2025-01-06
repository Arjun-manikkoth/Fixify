import React from "react";
import {otpVerifyApi} from "../../Api/ProviderApis";
import "react-toastify/dist/ReactToastify.css";
import {otpResendApi} from "../../Api/ProviderApis";
import OtpVerifyModal from "../CommonComponents/Modals/OtpVerifyModal";

interface OtpVerifyProps {
     openModal: (type: "userSignIn" | "providerSignIn") => void;
     otpOnSucess: React.Dispatch<React.SetStateAction<string | null>>;
}

const OtpVerificationModal: React.FC<OtpVerifyProps> = ({openModal, otpOnSucess}) => {
     return (
          <OtpVerifyModal
               title="Verify Account"
               onSubmit={otpVerifyApi}
               onResend={otpResendApi}
               accountType="provider"
               mailType="providerEmail"
               openModal={openModal}
               message="We’ve sent a one-time password (OTP) to your registered email. Enter the  code here to verify your account."
               messageDisplay={otpOnSucess}
          />
     );
};

export default OtpVerificationModal;
