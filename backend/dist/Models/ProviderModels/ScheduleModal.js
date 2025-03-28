"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const scheduleSchema = new mongoose_1.Schema({
    technician_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Technician",
        required: true,
    },
    location: {
        address: {
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            street: {
                type: String,
                required: true,
            },
        },
        geo: {
            type: { type: String, default: "Point" },
            coordinates: {
                type: [Number],
                required: true,
                validate: {
                    validator: function (coords) {
                        return coords.length === 2;
                    },
                    message: "Coordinates must be an array of exactly two numbers [longitude, latitude].",
                },
            },
        },
    },
    date: { type: Date, required: true },
    slots: [
        {
            time: { type: Date, required: true },
            status: {
                type: String,
                enum: ["available", "booked"],
                default: "available",
            },
        },
    ],
    requests: [
        {
            description: { type: String, required: true },
            status: {
                type: String,
                enum: ["pending", "booked", "cancelled"],
                default: "pending",
            },
            user_id: { type: mongoose_1.Schema.Types.ObjectId, required: true },
            address: {
                house_name: String,
                landmark: String,
                city: String,
                state: String,
                pincode: String,
                latitude: Number,
                longitude: Number,
            },
            time: { type: Date },
        },
    ],
    is_active: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
scheduleSchema.index({ "location.geo": "2dsphere" });
const ScheduleModel = mongoose_1.default.model("schedule", scheduleSchema);
exports.default = ScheduleModel;
