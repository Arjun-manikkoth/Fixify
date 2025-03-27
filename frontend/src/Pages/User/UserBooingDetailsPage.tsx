import React from "react";
import UserHeader from "../../Components/UserComponents/UserHeader";
import UserSidebar from "../../Components/UserComponents/UserSidebar";
import UserBookingDetail from "../../Components/UserComponents/UserBookingDetail";

const BookingDetailsPage: React.FC = () => {
    return (
        <>
            <UserSidebar />
            <UserHeader />
            <UserBookingDetail />
        </>
    );
};

export default BookingDetailsPage;
