import React from "react";
import UserHeader from "../../Components/UserComponents/UserHeader";
import UserSidebar from "../../Components/UserComponents/UserSidebar";
import UserBookingList from "../../Components/UserComponents/UserBooking";

const BookingsPage: React.FC = () => {
    return (
        <>
            <UserSidebar />
            <UserHeader />
            <UserBookingList />
        </>
    );
};

export default BookingsPage;
