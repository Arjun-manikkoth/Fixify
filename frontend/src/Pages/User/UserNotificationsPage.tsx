import React from "react";
import UserHeader from "../../Components/UserComponents/UserHeader";
import UserSidebar from "../../Components/UserComponents/UserSidebar";
import Notifications from "../../Components/CommonComponents/Notifications";

const NotificationsPage: React.FC = () => {
    return (
        <>
            <UserSidebar />
            <UserHeader />
            <Notifications />
        </>
    );
};

export default NotificationsPage;
