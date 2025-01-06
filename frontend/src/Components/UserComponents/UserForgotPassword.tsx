import React from "react";
import ForgotPasswordModal from "../CommonComponents/Modals/ForgotPasswordModal";
import {forgotPasswordApi} from "../../Api/UserApis";

interface ForgotPasswordModalProps {
     closeModal: () => void;
     openModal: (type: "userPasswordOtp" | "providerPasswordOtp") => void;
     accountType: string;
}

const UserForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({closeModal, openModal}) => {
     return (
          <>
               <ForgotPasswordModal
                    closeModal={closeModal}
                    sendMail={forgotPasswordApi}
                    openModal={openModal}
                    accountType="user"
               />
          </>
     );
};

export default UserForgotPasswordModal;
