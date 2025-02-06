import React from "react";
import ProviderSidebar from "../../Components/ProviderComponents/ProviderSideBar";
import ProviderHeader from "../../Components/ProviderComponents/ProviderHeader";
import ProviderSlotRequests from "../../Components/ProviderComponents/ProviderSlotRequest";

const BookingRequestPage: React.FC = () => {
    return (
        <>
            <div className="flex">
                <ProviderSidebar />

                <div className="flex-1 ml-72">
                    <ProviderHeader />

                    <ProviderSlotRequests />
                </div>
            </div>
        </>
    );
};

export default BookingRequestPage;
