import React, { useState, useRef } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { reviewApi } from "../../../Api/UserApis";
import LoadingSpinner from "../LoadingSpinner";

interface IRatings {
    booking_id: string;
    provider_id: string;
    closeModal: React.Dispatch<React.SetStateAction<boolean>>;
    handleRefresh: () => void;
}

const Ratings: React.FC<IRatings> = ({ booking_id, provider_id, closeModal, handleRefresh }) => {
    const [rating, setRating] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [review, setReview] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [images, setImages] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        setImages((prev) => [...selectedFiles, ...prev].slice(0, 3));
    };

    const handleDeleteImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!rating) return toast.error("Rate your provider service");
        if (!review.trim()) return toast.error("Kindly provide a review title");
        if (!description.trim()) return toast.error("Kindly give a brief description");
        if (images.length === 0) return toast.error("Choose at least one work image");
        if (images.length > 3) return toast.error("You can only add up to 3 images");

        try {
            setLoading(true);
            const response = await reviewApi({
                rating,
                review,
                description,
                images,
                booking_id,
                provider_id,
            });
            if (response.success) {
                toast.success("Review submitted successfully");
                handleRefresh();

                closeModal(false);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 p-4">
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="relative bg-white p-6 rounded-2xl shadow-md w-full max-w-lg">
                    {/* Close Button */}
                    <button
                        onClick={() => closeModal(false)}
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes size={20} />
                    </button>

                    <h2 className="text-xl font-semibold mb-4 text-center">
                        Customer Ratings & Reviews
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Rating Selection */}
                        <div>
                            <label className="block text-gray-700">Your Rating (out of 5):</label>
                            <div className="flex space-x-1 mt-4">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar
                                        key={i}
                                        className={`cursor-pointer ${
                                            i < rating ? "text-yellow-500" : "text-gray-300"
                                        }`}
                                        onClick={() => setRating(i + 1)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Review Title */}
                        <input
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                            placeholder="Review title..."
                            value={review}
                            maxLength={30}
                            onChange={(e) => setReview(e.target.value)}
                        />

                        {/* Review Description */}
                        <textarea
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Write your detailed experience..."
                            maxLength={100}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-gray-700">Upload Images (Max: 3)</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="w-full mt-2"
                            />
                            <div className="flex space-x-2 mt-4">
                                {images.map((image, index) => (
                                    <div key={index} className="relative pt-4">
                                        <button
                                            onClick={() => handleDeleteImage(index)}
                                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-gray-600 hover:text-red-500"
                                        >
                                            <FaTimes size={14} />
                                        </button>
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt="Preview"
                                            className="w-16 h-16 rounded-md object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                        >
                            Submit Review
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Ratings;
