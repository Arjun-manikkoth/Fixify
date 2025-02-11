import { fetchBookingDetailsApi } from "../../Api/UserApis";
import BookingDetails from "../CommonComponents/BookingDetails";

const BookingDetail: React.FC = () => {
    return <BookingDetails role="user" bookingDetailsApi={fetchBookingDetailsApi} />;
};

export default BookingDetail;
