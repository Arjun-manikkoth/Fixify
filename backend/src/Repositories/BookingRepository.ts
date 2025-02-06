import IBookingRepository from "../Interfaces/Booking/IBookingRepository";
import Booking from "../Models/ProviderModels/BookingModel";
import { IFilteredSchedule } from "../Interfaces/Booking/IBooking";

class BookingRepository implements IBookingRepository {
    async createBooking(data: IFilteredSchedule, request_id: string): Promise<boolean | null> {
        try {
            console.log(data, "data");
            const request = data.requests.filter((each) => {
                return each._id.toString() === request_id;
            });
            console.log(request[0].address);
            const booking = new Booking({
                user_id: request[0].user_id,
                provider_id: data.technician._id,
                service_id: data.technician.service_id,
                user_address: request[0].address,
                time: request[0].time,
                date: data.date,
                status: "confirmed",
                description: request[0].description,
            });

            const status = await booking.save();
            return status ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
}
export default BookingRepository;
