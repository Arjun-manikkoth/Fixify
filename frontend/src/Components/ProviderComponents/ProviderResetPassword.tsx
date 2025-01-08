import React from "react";
import NewPasswordModal from "../CommonComponents/Modals/NewPasswordModal";
import {resetPasswordApi} from "../../Api/ProviderApis";
import {logoutProvider} from "../../Api/ProviderApis";

interface IResetPasswordProps {
     setModal: React.Dispatch<React.SetStateAction<"changePassword" | "newPassword" | "">>;
}

const ProviderResetPassword: React.FC<IResetPasswordProps> = ({setModal}) => {
     return (
          <>
               <NewPasswordModal
                    role="provider"
                    title="Reset Password"
                    setModal={setModal}
                    submitPassword={resetPasswordApi}
                    logout={logoutProvider}
               />
          </>
     );
};
export default ProviderResetPassword;
