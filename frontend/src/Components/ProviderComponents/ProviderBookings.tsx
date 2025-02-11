import { fetchBookingsApi } from "../../Api/ProviderApis";
import Bookings from "../CommonComponents/Bookings";

const ProviderBookingList: React.FC = () => {
    return <Bookings role="provider" bookingsApi={fetchBookingsApi} />;
};

export default ProviderBookingList;
