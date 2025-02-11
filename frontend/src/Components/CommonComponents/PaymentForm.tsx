import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import axios from "axios";

const PaymentForm = ({ amount }: { amount: number }) => {
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
            const { data } = await axios.post("/api/payments/create-payment-intent", { amount });

            if (!data.success) {
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

            const { paymentIntent, error } = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (error) {
                setError(error.message || "Payment failed");
                setLoading(false);
            } else if (paymentIntent.status === "succeeded") {
                setSuccess(true);
                setLoading(false);
            }
        } catch (err) {
            setError("Server error. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div>
            {success ? (
                <p className="text-green-600">Payment Successful!</p>
            ) : (
                <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow">
                    <CardElement className="p-2 border rounded" />
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        {loading ? "Processing..." : "Pay Now"}
                    </button>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </form>
            )}
        </div>
    );
};

export default PaymentForm;
