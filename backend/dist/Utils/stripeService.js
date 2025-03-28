"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = void 0;
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia",
});
const createPaymentIntent = (amount_1, ...args_1) => __awaiter(void 0, [amount_1, ...args_1], void 0, function* (amount, currency = "inr") {
    try {
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency,
            payment_method_types: ["card"],
        });
        return {
            success: true,
            message: "Successfully created payment intent",
            clientSecret: paymentIntent.client_secret,
        };
    }
    catch (error) {
        console.error("Error creating payment intent:", error);
        return { success: false, message: "Failed to create payment intent", clientSecret: null };
    }
});
exports.createPaymentIntent = createPaymentIntent;
