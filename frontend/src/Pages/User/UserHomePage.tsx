import React from "react";
import UserHeader from "../../Components/UserComponents/UserHeader";
import UserSidebar from "../../Components/UserComponents/UserSidebar";
import UserProfile from "../../Components/UserComponents/UserProfile";

const HomePage: React.FC = () => {
    return (
        <>
            <UserSidebar />

            <UserHeader />

            <UserProfile />
        </>
    );
};

export default HomePage;
