// src/components/CommonComponents/Modals/ReportModal.tsx
import React, { useState } from "react";
import { toast } from "react-toastify";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reported_id: string;
    reporter_id: string;
    reported_role: "user" | "provider";
    booking_id: string;
    reportApi: (data: {
        reporter_id: string;
        reported_id: string;
        reported_role: string;
        reason: string;
        booking_id: string;
    }) => any;
}

const ReportModal: React.FC<ReportModalProps> = ({
    isOpen,
    onClose,
    reported_id,
    reporter_id,
    reported_role,
    reportApi,
    booking_id,
}) => {
    const [reason, setReason] = useState("");

    const reportReasons = [
        "Fraudulent Activity",
        "Harassment",
        "Inappropriate Behavior",
        "Poor Service Quality",
        "Fake Profile",
        "Other",
    ];

    const handleSubmit = async () => {
        if (!reason) {
            toast.error("Please select a reason for reporting.");
            return;
        }

        try {
            const response = await reportApi({
                reporter_id,
                reported_id,
                reported_role,
                reason,
                booking_id,
            });
            if (response?.success) {
                toast.success("Report submitted successfully.");
                onClose();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Error submitting report.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Report {reported_role}</h3>
                <select
                    className="w-full p-2 border border-gray-300 rounded mb-4 text-sm sm:text-base"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                >
                    <option value="">Select a reason</option>
                    {reportReasons.map((r) => (
                        <option key={r} value={r}>
                            {r}
                        </option>
                    ))}
                </select>
                <div className="flex justify-end space-x-2 sm:space-x-4">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-300 rounded text-sm sm:text-base hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 text-white rounded text-sm sm:text-base hover:bg-red-600"
                    >
                        Submit Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
