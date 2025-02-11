import React from "react";
import ProviderSidebar from "../../Components/ProviderComponents/ProviderSideBar";
import ProviderHeader from "../../Components/ProviderComponents/ProviderHeader";
import ProviderBookingList from "../../Components/ProviderComponents/ProviderBookings";

const BookingsPage: React.FC = () => {
    return (
        <>
            <div className="flex">
                <ProviderSidebar />

                <div className="flex-1 ml-72">
                    <ProviderHeader />

                    <ProviderBookingList />
                </div>
            </div>
        </>
    );
};

export default BookingsPage;
