import { fetchBookingsApi } from "../../Api/UserApis";
import Bookings from "../CommonComponents/Bookings";

const UserBookingList: React.FC = () => {
    return <Bookings role="user" bookingsApi={fetchBookingsApi} />;
};

export default UserBookingList;
