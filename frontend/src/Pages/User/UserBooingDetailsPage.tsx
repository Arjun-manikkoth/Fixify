import React from "react";
import UserHeader from "../../Components/UserComponents/UserHeader";
import UserSidebar from "../../Components/UserComponents/UserSidebar";
import UserBookingDetail from "../../Components/UserComponents/UserBookingDetail";

const BookingDetailsPage: React.FC = () => {
    return (
        <>
            <div className="flex">
                <UserSidebar />
                <div className="flex-1 ml-72">
                    <UserHeader />
                    <UserBookingDetail />
                </div>
            </div>
        </>
    );
};

export default BookingDetailsPage;
