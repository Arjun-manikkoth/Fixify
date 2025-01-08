import React from "react";
import ChangePasswordModal from "../CommonComponents/Modals/ChangePasswordModal";
import {confirmPasswordApi} from "../../Api/ProviderApis";

interface IChangePasswordProps {
     setModal: React.Dispatch<React.SetStateAction<"changePassword" | "newPassword" | "">>;
}
const ChangePasswordModalProvider: React.FC<IChangePasswordProps> = ({setModal}) => {
     return (
          <>
               <ChangePasswordModal
                    role="provider"
                    title="Confirm Password"
                    verifyPassword={confirmPasswordApi}
                    setModal={setModal}
               />
          </>
     );
};

export default ChangePasswordModalProvider;
