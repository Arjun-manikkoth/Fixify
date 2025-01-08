import React from "react";
import NewPasswordModal from "../CommonComponents/Modals/NewPasswordModal";
import {resetPasswordApi} from "../../Api/UserApis";
import {logoutUser} from "../../Api/UserApis";

interface IResetPasswordProps {
     setModal: React.Dispatch<React.SetStateAction<"changePassword" | "newPassword" | "">>;
}

const UserResetPassword: React.FC<IResetPasswordProps> = ({setModal}) => {
     return (
          <>
               <NewPasswordModal
                    role="user"
                    title="Reset Password"
                    setModal={setModal}
                    submitPassword={resetPasswordApi}
                    logout={logoutUser}
               />
          </>
     );
};
export default UserResetPassword;
