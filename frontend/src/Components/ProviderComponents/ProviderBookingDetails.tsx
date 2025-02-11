import { fetchBookingDetailsApi } from "../../Api/ProviderApis";
import BookingDetails from "../CommonComponents/BookingDetails";

const BookingDetail: React.FC = () => {
    return <BookingDetails role="provider" bookingDetailsApi={fetchBookingDetailsApi} />;
};

export default BookingDetail;
