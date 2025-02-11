import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

const PaymentFormModal = ({
    isOpen,
    onClose,
    amount,
    payment_id,
    paymentApi,
    handleRefresh,
}: {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    paymentApi: (id: string, amount: number) => any;
    payment_id: string;
    handleRefresh: () => void;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            const response = await paymentApi(payment_id, amount);
            if (!response.success) {
                setError("Payment initiation failed");
                setLoading(false);
                return;
            }

            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                setError("Card details are missing");
                setLoading(false);
                return;
            }

            const { paymentIntent, error } = await stripe.confirmCardPayment(
                response.data.clientSecret,
                {
                    payment_method: { card: cardElement },
                }
            );

            if (error) {
                setError(error.message || "Payment failed");
                setLoading(false);
            } else if (paymentIntent.status === "succeeded") {
                setSuccess(true);
                setLoading(false);
                setTimeout(() => {
                    handleRefresh();
                    onClose();
                }, 3000);
            }
        } catch (err) {
            setError("Server error. Please try again.");
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md transform transition-all ease-in-out">
                <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Payment</h2>

                {success ? (
                    <div className="text-center p-6 rounded-lg ">
                        <p className="text-lg font-semibold text-green-700">Payment Successful!</p>
                        <p className="text-gray-600 mt-2 pb-2">
                            Your transaction has been completed successfully.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                            <CardElement className="p-2" />
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <button
                                type="button"
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600 transition"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-brandBlue text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                            >
                                {loading ? "Processing..." : `Pay ₹${amount}`}
                            </button>
                        </div>

                        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                    </form>
                )}
            </div>
        </div>
    );
};

export default PaymentFormModal;
