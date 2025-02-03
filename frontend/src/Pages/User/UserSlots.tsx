import React from "react";
import UserHeader from "../../Components/UserComponents/UserHeader";
import UserSidebar from "../../Components/UserComponents/UserSidebar";
import UserSlots from "../../Components/UserComponents/UserSlots";

const SlotPage: React.FC = () => {
    return (
        <>
            <div className="flex">
                <UserSidebar />

                <div className="flex-1 ml-72">
                    <UserHeader />

                    <UserSlots />
                </div>
            </div>
        </>
    );
};

export default SlotPage;
