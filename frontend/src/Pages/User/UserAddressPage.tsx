import React from "react";
import UserHeader from "../../Components/UserComponents/UserHeader";
import UserSidebar from "../../Components/UserComponents/UserSidebar";
import UserAddressPage from "../../Components/UserComponents/UserAddress";

const AddressPage: React.FC = () => {
    return (
        <>
            <div className="flex">
                <UserSidebar />
                <div className="flex-1 ml-72">
                    <UserHeader />
                    <UserAddressPage />
                </div>
            </div>
        </>
    );
};

export default AddressPage;
