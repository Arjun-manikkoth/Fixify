import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
    reporterId: mongoose.Types.ObjectId; // User who is reporting
    reportedId: mongoose.Types.ObjectId; // User or Provider being reported
    reportedRole: "User" | "Provider"; // Role of the reported person
    reason: string; // Reason for reporting
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
    {
        booking_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        reporterId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        reportedId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        reportedRole: {
            type: String,
            enum: ["user", "provider"],
            required: true,
        },
        reason: {
            type: String,
            enum: [
                "Fraudulent Activity",
                "Harassment",
                "Inappropriate Behavior",
                "Poor Service Quality",
                "Fake Profile",
                "Other",
            ],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Report = mongoose.model<IReport>("Report", ReportSchema);
export default Report;
