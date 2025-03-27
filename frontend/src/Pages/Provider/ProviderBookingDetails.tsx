import React from "react";
import ProviderSidebar from "../../Components/ProviderComponents/ProviderSideBar";
import ProviderHeader from "../../Components/ProviderComponents/ProviderHeader";
import ProviderBookingDetail from "../../Components/ProviderComponents/ProviderBookingDetails";

const BookingDetailPage: React.FC = () => {
    return (
        <>
            <ProviderSidebar />
            <ProviderHeader />
            <ProviderBookingDetail />
        </>
    );
};

export default BookingDetailPage;
