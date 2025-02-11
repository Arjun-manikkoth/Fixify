import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-01-27.acacia" as any,
});

export const createPaymentIntent = async (amount: number, currency = "inr") => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency,
            payment_method_types: ["card"],
        });

        return {
            success: true,
            message: "Successfully created payment intent",
            clientSecret: paymentIntent.client_secret,
        };
    } catch (error) {
        console.error("Error creating payment intent:", error);
        return { success: false, message: "Failed to create payment intent", clientSecret: null };
    }
};
