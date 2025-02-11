import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSubmit: (paymentData: PaymentData) => void;
    handleRefresh: () => void;
}

interface PaymentData {
    amount: number;
    method: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    onPaymentSubmit,
    handleRefresh,
}) => {
    const [amount, setAmount] = useState<string>("");
    const [method, setMethod] = useState<string>("by cash");

    if (!isOpen) return null;

    const handlePayment = () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }
        onPaymentSubmit({ amount: parseFloat(amount), method });
        toast.success("Payment request initiated!");
        setTimeout(() => {
            handleRefresh();
        }, 2000);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Choose Payment Method</h2>

                {/* Payment Amount Input */}
                <label className="block mb-2 font-medium">Amount</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2 border rounded-md mb-4 arrow-hide"
                    placeholder="Enter amount"
                />

                {/* Payment Method Selection */}
                <label className="block mb-2 font-medium">Payment Method</label>
                <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full p-2 border rounded-md mb-4"
                >
                    <option value="by cash">By Cash</option>
                    <option value="online">Online Payment</option>
                </select>

                {/* Buttons */}
                <div className="flex justify-between mt-4">
                    <button
                        onClick={onClose}
                        className="bg-red-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePayment}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                    >
                        Request Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
