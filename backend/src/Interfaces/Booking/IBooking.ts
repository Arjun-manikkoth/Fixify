export interface IFilteredSchedule {
    technician: IFilteredTechnician;
    date: Date;
    requests: IRequests[];
}

interface IFilteredTechnician {
    _id: string;
    name: string;
    service_id: string;
    email: string;
    phone: string;
}

interface IRequests {
    _id: string;
    description: string;
    status: "pending" | "booked" | "cancelled";
    user_id: string;
    address: IAddress;
    time: string;
}

interface IAddress {
    house_name: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
}
