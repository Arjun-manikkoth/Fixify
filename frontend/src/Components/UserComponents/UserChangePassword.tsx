import React, {useState} from "react";
import ChangePasswordModal from "../CommonComponents/Modals/ChangePasswordModal";
import {confirmPasswordApi} from "../../Api/UserApis";

interface IChangePasswordProps {
     setModal: React.Dispatch<React.SetStateAction<"changePassword" | "newPassword" | "">>;
}
const ChangePasswordModalUser: React.FC<IChangePasswordProps> = ({setModal}) => {
     return (
          <>
               <ChangePasswordModal
                    role="user"
                    title="Confirm Password"
                    verifyPassword={confirmPasswordApi}
                    setModal={setModal}
               />
          </>
     );
};

export default ChangePasswordModalUser;
