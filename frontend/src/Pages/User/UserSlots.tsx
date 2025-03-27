import React from "react";
import UserHeader from "../../Components/UserComponents/UserHeader";
import UserSidebar from "../../Components/UserComponents/UserSidebar";
import UserSlots from "../../Components/UserComponents/UserSlots";

const SlotPage: React.FC = () => {
    return (
        <>
            <UserSidebar />
            <UserHeader />
            <UserSlots />
        </>
    );
};

export default SlotPage;
