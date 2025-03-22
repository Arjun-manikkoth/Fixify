import React from "react";
import UserHeader from "../../Components/UserComponents/UserHeader";
import UserSidebar from "../../Components/UserComponents/UserSidebar";
import Notifications from "../../Components/CommonComponents/Notifications";

const NotificationsPage: React.FC = () => {
    return (
        <>
            <div className="flex">
                <UserSidebar />

                <div className="flex-1 ml-72">
                    <UserHeader />

                    <Notifications />
                </div>
            </div>
        </>
    );
};

export default NotificationsPage;
