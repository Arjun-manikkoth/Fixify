import React from "react";
import UserHeader from "../../Components/UserComponents/UserHeader";
import UserSidebar from "../../Components/UserComponents/UserSidebar";
import UserAddressPage from "../../Components/UserComponents/UserAddress";

const AddressPage: React.FC = () => {
    return (
        <>
            <UserSidebar />
            <UserHeader />
            <UserAddressPage />
        </>
    );
};

export default AddressPage;
