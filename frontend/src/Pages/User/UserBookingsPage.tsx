import React from "react";
import UserHeader from "../../Components/UserComponents/UserHeader";
import UserSidebar from "../../Components/UserComponents/UserSidebar";
import UserBookingList from "../../Components/UserComponents/UserBooking";

const BookingsPage: React.FC = () => {
    return (
        <>
            <div className="flex">
                <UserSidebar />
                <div className="flex-1 ml-72">
                    <UserHeader />
                    <UserBookingList />
                </div>
            </div>
        </>
    );
};

export default BookingsPage;
