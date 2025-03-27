import React from "react";
import ProviderSidebar from "../../Components/ProviderComponents/ProviderSideBar";
import ProviderHeader from "../../Components/ProviderComponents/ProviderHeader";
import ProviderSlotRequests from "../../Components/ProviderComponents/ProviderSlotRequest";

const BookingRequestPage: React.FC = () => {
    return (
        <>
            <ProviderSidebar />
            <ProviderHeader />
            <ProviderSlotRequests />
        </>
    );
};

export default BookingRequestPage;
