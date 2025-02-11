import React from "react";
import ProviderSidebar from "../../Components/ProviderComponents/ProviderSideBar";
import ProviderHeader from "../../Components/ProviderComponents/ProviderHeader";
import ProviderBookingDetail from "../../Components/ProviderComponents/ProviderBookingDetails";

const BookingDetailPage: React.FC = () => {
    return (
        <>
            <div className="flex">
                <ProviderSidebar />

                <div className="flex-1 ml-72">
                    <ProviderHeader />
                    <ProviderBookingDetail />
                </div>
            </div>
        </>
    );
};

export default BookingDetailPage;
