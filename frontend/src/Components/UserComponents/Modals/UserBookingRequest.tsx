import React, { useState } from "react";
import { FaWindowClose } from "react-icons/fa";
import { toast } from "react-toastify";
import { IAddress } from "./UserChooseAddress";
import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/Store";
import { ISelectedSlot } from "../UserSlots";
import { bookingRequestApi } from "../../../Api/UserApis";
import LoadingSpinner from "../../CommonComponents/LoadingSpinner";

interface BookingRequestProps {
    closeModal: React.Dispatch<React.SetStateAction<boolean>>;
    address: IAddress | null;
    slotDetails: ISelectedSlot;
}

const BookingRequest: React.FC<BookingRequestProps> = ({ slotDetails, closeModal, address }) => {
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState<boolean>(false);

    const user = useSelector((state: RootState) => state.user);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!description.trim()) {
            toast.error("Please provide a description of the work.");
            return;
        }

        const descriptionFormatted = description.trim();

        if (user.id && address) {
            setLoading(true);
            bookingRequestApi({
                user_id: user.id,
                description: descriptionFormatted,
                address,
                ...slotDetails,
            }).then((res) => {
                if (res.success) {
                    closeModal(false);
                    toast.success("Booking request sent");
                    setDescription("");
                } else {
                    toast.error(res.message);
                }
                setLoading(false);
            });
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 overflow-y-auto">
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="relative bg-white pt-6 pb-8 px-6 rounded-lg shadow-lg w-full max-w-md max-h-full overflow-y-auto">
                    {/* Close Button */}
                    <button
                        onClick={() => closeModal(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
                    >
                        <FaWindowClose className="text-xl " />
                    </button>

                    {/* Booking Form */}

                    <h2 className="text-2xl font-semibold text-gray-800 mb-8">Request a Booking</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Work Description */}
                        <div>
                            <label
                                htmlFor="description"
                                className="block text-gray-700 font-medium"
                            >
                                Work Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                maxLength={60}
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe the work to be done..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        {/* Submit Button */}
                        <div className="text-right">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-all duration-200 ease-in-out"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default BookingRequest;
