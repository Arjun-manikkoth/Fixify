import React from "react";
import ProviderSidebar from "../../Components/ProviderComponents/ProviderSideBar";
import ProviderHeader from "../../Components/ProviderComponents/ProviderHeader";
import ProviderBookingList from "../../Components/ProviderComponents/ProviderBookings";

const BookingsPage: React.FC = () => {
    return (
        <>
            <ProviderSidebar />
            <ProviderHeader />
            <ProviderBookingList />
        </>
    );
};

export default BookingsPage;
