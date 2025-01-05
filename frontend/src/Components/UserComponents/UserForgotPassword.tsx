import React from "react";
import ForgotPasswordModal from "../CommonComponents/Modals/ForgotPasswordModal";
import {forgotPasswordApi} from "../../Api/UserApis";

interface ForgotPasswordModalProps {
     closeModal: () => void;
}

const UserForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({closeModal}) => {
     return (
          <>
               <ForgotPasswordModal closeModal={closeModal} sendMail={forgotPasswordApi} />
          </>
     );
};

export default UserForgotPasswordModal;
